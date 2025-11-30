import { createServer } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import { storage } from "./storage.js";
import { signupPlayerSchema } from "../shared/schema.js";
// -------------------- Helpers / setup --------------------
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir))
    fs.mkdirSync(uploadsDir, { recursive: true });
const multerStorage = multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ok = /jpeg|jpg|png|gif/i.test(file.mimetype);
        if (ok)
            cb(null, true);
        else
            cb(new Error("Only image files are allowed"));
    },
});
function isAuthenticated(req, res, next) {
    if (req.session?.playerId)
        return next();
    return res.status(401).json({ message: "Unauthorized" });
}
async function isAdmin(req, res, next) {
    if (!req.session?.playerId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getPlayer(req.session.playerId);
    const isAdminFlag = user?.is_admin || user?.isAdmin;
    if (!user || !isAdminFlag) {
        return res.status(403).json({ message: "Forbidden - Admin access required" });
    }
    req.user = user;
    next();
}
// -------------------- Routes --------------------
export async function registerRoutes(app) {
    // -------- AUTH: Signup --------
    app.post("/api/auth/signup", upload.single("photo"), async (req, res) => {
        try {
            // Normalize raw form values
            const raw = req.body ?? {};
            const normalized = {
                email: String(raw.email ?? "").trim().toLowerCase(),
                password: String(raw.password ?? ""),
                fullName: String(raw.fullName ?? "").trim(),
                // allow "" -> undefined so zod can show a clean error if truly missing
                age: raw.age === "" || raw.age === undefined
                    ? undefined
                    : Number.parseInt(String(raw.age), 10),
                country: String(raw.country ?? "").trim(),
                location: String(raw.location ?? "").trim(),
                ranking: raw.ranking === undefined || raw.ranking === ""
                    ? null
                    : String(raw.ranking), // DB column is text; keep as string
                specialization: String(raw.specialization ?? "").trim(),
                bio: String(raw.bio ?? "").trim(),
                fundingGoals: String(raw.fundingGoals ?? "").trim(),
                videoUrl: String(raw.videoUrl ?? "").trim(), // schema allows "" or valid URL
                atpProfileUrl: raw.atpProfileUrl === undefined || raw.atpProfileUrl === ""
                    ? undefined
                    : String(raw.atpProfileUrl).trim(),
            };
            const parsed = signupPlayerSchema.safeParse(normalized);
            if (!parsed.success) {
                // Return clear validation errors for the UI
                console.error("❌ Signup validation failed:", parsed.error.issues);
                return res.status(400).json({
                    message: "Invalid input",
                    errors: parsed.error.issues.map((i) => ({
                        path: i.path.join("."),
                        message: i.message,
                    })),
                });
            }
            const data = parsed.data;
            // Email already taken?
            const existing = await storage.getPlayerByEmail(data.email);
            if (existing) {
                return res.status(400).json({ message: "Email already registered" });
            }
            // Hash password
            const passwordHash = await bcrypt.hash(data.password, 10);
            // Handle optional file upload
            const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
            // Build payload for storage.createPlayer (maps camelCase -> DB columns)
            const toCreate = {
                email: data.email,
                passwordHash,
                fullName: data.fullName,
                age: data.age, // already a number per schema
                country: data.country,
                location: data.location,
                ranking: data.ranking ?? null, // text column
                specialization: data.specialization,
                bio: data.bio,
                fundingGoals: data.fundingGoals,
                videoUrl: data.videoUrl ? data.videoUrl : null,
                atpProfileUrl: data.atpProfileUrl ?? null,
                photoUrl,
                // server-side defaults
                published: false,
                featured: false,
                priority: "normal",
                // active defaults to true in schema/storage, but pass it to be explicit
                active: true,
            };
            const player = await storage.createPlayer(toCreate);
            req.session.playerId = player.id;
            // never return password hashes
            res.json({ player: { ...player, password_hash: undefined, passwordHash: undefined } });
        }
        catch (e) {
            console.error("Signup error:", e);
            res.status(500).json({ message: "Failed to create account" });
        }
    });
    // -------- AUTH: Signin --------
    app.post("/api/auth/signin", async (req, res) => {
        try {
            const { email, password } = req.body ?? {};
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }
            const player = await storage.getPlayerByEmail(String(email).toLowerCase());
            if (!player)
                return res.status(401).json({ message: "Invalid credentials" });
            const hash = player.password_hash || player.passwordHash;
            if (!hash)
                return res.status(401).json({ message: "Invalid credentials" });
            const ok = await bcrypt.compare(String(password), String(hash));
            if (!ok)
                return res.status(401).json({ message: "Invalid credentials" });
            req.session.playerId = player.id;
            res.json({
                player: {
                    id: player.id,
                    email: player.email,
                    fullName: player.fullName, // ✅ Changed from player.full_name
                    age: player.age,
                    country: player.country,
                    location: player.location,
                    ranking: player.ranking,
                    specialization: player.specialization,
                    bio: player.bio,
                    fundingGoals: player.fundingGoals, // ✅ Changed from player.funding_goals
                    videoUrl: player.videoUrl, // ✅ Changed from player.video_url
                    photoUrl: player.photoUrl, // ✅ Changed from player.photo_url
                    published: player.published,
                    featured: player.featured,
                    priority: player.priority,
                    isAdmin: player.isAdmin, // ✅ Changed from player.is_admin
                    approvalStatus: player.approvalStatus, // ✅ Changed from player.approval_status
                    approvedBy: player.approvedBy, // ✅ Changed from player.approved_by
                    approvedAt: player.approvedAt, // ✅ Changed from player.approved_at
                    createdAt: player.createdAt, // ✅ Changed from player.created_at
                    active: player.active,
                },
            });
        }
        catch (e) {
            console.error("Signin error:", e);
            res.status(500).json({ message: "Failed to sign in" });
        }
    });
    // -------- AUTH: Logout --------
    app.post("/api/auth/logout", (req, res) => {
        req.session?.destroy((err) => {
            if (err)
                return res.status(500).json({ message: "Failed to logout" });
            res.clearCookie("connect.sid");
            res.json({ message: "Logged out successfully" });
        });
    });
    // -------- AUTH: Me --------
    app.get("/api/auth/me", isAuthenticated, async (req, res) => {
        try {
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
            const p = await storage.getPlayer(req.session.playerId);
            if (!p)
                return res.status(404).json({ message: "Player not found" });
            res.json({
                id: p.id,
                email: p.email,
                fullName: p.fullName, // ✅ Changed
                age: p.age,
                country: p.country,
                location: p.location,
                ranking: p.ranking,
                specialization: p.specialization,
                bio: p.bio,
                fundingGoals: p.fundingGoals, // ✅ Changed
                videoUrl: p.videoUrl, // ✅ Changed
                photoUrl: p.photoUrl, // ✅ Changed
                published: p.published,
                featured: p.featured,
                priority: p.priority,
                isAdmin: p.isAdmin, // ✅ Changed
                approvalStatus: p.approvalStatus, // ✅ Changed
                approvedBy: p.approvedBy, // ✅ Changed
                approvedAt: p.approvedAt, // ✅ Changed
                createdAt: p.createdAt, // ✅ Changed
                active: p.active,
            });
        }
        catch (e) {
            console.error("/api/auth/me error:", e);
            res.status(500).json({ message: "Failed to get player" });
        }
    });
    // -------- PUBLIC: Browse players --------
    app.get("/api/players", async (_req, res) => {
        try {
            const list = await storage.getPublishedPlayers();
            const transformed = list
                .filter((p) => p.active !== false)
                .map((p) => ({
                id: p.id,
                fullName: p.fullName, // ✅ CHANGE BACK
                location: p.location,
                ranking: p.ranking,
                specialization: p.specialization,
                bio: p.bio,
                fundingGoals: p.fundingGoals, // ✅ CHANGE BACK
                videoUrl: p.videoUrl, // ✅ CHANGE BACK
                photoUrl: p.photoUrl, // ✅ CHANGE BACK
                country: p.country,
                age: p.age,
            }));
            res.json(transformed);
        }
        catch (e) {
            console.error("Get players error:", e);
            res.status(500).json({ message: "Failed to get players" });
        }
    });
    // Get single player by ID
    app.get("/api/players/:id", async (req, res) => {
        try {
            const player = await storage.getPlayer(req.params.id);
            if (!player) {
                return res.status(404).json({ message: "Player not found" });
            }
            // Transform to camelCase if needed
            const transformed = {
                id: player.id,
                fullName: player.fullName,
                email: player.email,
                age: player.age,
                country: player.country,
                location: player.location,
                ranking: player.ranking,
                specialization: player.specialization,
                bio: player.bio,
                fundingGoals: player.fundingGoals,
                videoUrl: player.videoUrl,
                atpProfileUrl: player.atpProfileUrl,
                photoUrl: player.photoUrl,
                published: player.published,
                featured: player.featured,
            };
            res.json(transformed);
        }
        catch (e) {
            console.error("Get player error:", e);
            res.status(500).json({ message: "Failed to get player" });
        }
    });
    // -------- ADMIN: Get all players --------
    app.get("/api/admin/players", isAdmin, async (_req, res) => {
        try {
            const players = await storage.getAllPlayers();
            res.json(players);
        }
        catch (e) {
            console.error("Admin get players error:", e);
            res.status(500).json({ message: "Failed to get players" });
        }
    });
    // -------- ADMIN: Approve player --------
    app.post("/api/admin/players/:id/approve", isAdmin, async (req, res) => {
        try {
            const adminId = req.session.playerId;
            const player = await storage.approvePlayer(req.params.id, adminId);
            if (!player)
                return res.status(404).json({ message: "Player not found" });
            res.json(player);
        }
        catch (e) {
            console.error("Approve player error:", e);
            res.status(500).json({ message: "Failed to approve player" });
        }
    });
    // -------- ADMIN: Reject player --------
    app.post("/api/admin/players/:id/reject", isAdmin, async (req, res) => {
        try {
            const adminId = req.session.playerId;
            const player = await storage.rejectPlayer(req.params.id, adminId);
            if (!player)
                return res.status(404).json({ message: "Player not found" });
            res.json(player);
        }
        catch (e) {
            console.error("Reject player error:", e);
            res.status(500).json({ message: "Failed to reject player" });
        }
    });
    // -------- ADMIN: Deactivate player --------
    app.post("/api/admin/players/:id/deactivate", isAdmin, async (req, res) => {
        try {
            const player = await storage.deactivatePlayer(req.params.id);
            if (!player)
                return res.status(404).json({ message: "Player not found" });
            res.json(player);
        }
        catch (e) {
            console.error("Deactivate player error:", e);
            res.status(500).json({ message: "Failed to deactivate player" });
        }
    });
    // -------- ADMIN: Activate player --------
    app.post("/api/admin/players/:id/activate", isAdmin, async (req, res) => {
        try {
            const player = await storage.activatePlayer(req.params.id);
            if (!player)
                return res.status(404).json({ message: "Player not found" });
            res.json(player);
        }
        catch (e) {
            console.error("Activate player error:", e);
            res.status(500).json({ message: "Failed to activate player" });
        }
    });
    // -------- ADMIN: Delete player --------
    app.delete("/api/admin/players/:id", isAdmin, async (req, res) => {
        try {
            await storage.deletePlayer(req.params.id);
            res.json({ message: "Player deleted" });
        }
        catch (e) {
            console.error("Delete player error:", e);
            res.status(500).json({ message: "Failed to delete player" });
        }
    });
    const httpServer = createServer(app);
    return httpServer;
}

// server/routes.ts
import { stripeHelpers } from "./stripe.js";
import { emailService } from "./email.js";
import { createServer } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import { storage } from "./storage.js";
import { db } from "./db.js";
import { players, signupPlayerSchema } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { verifyPlayerAgainstATP } from "./atp-verification.js";
// -------------------- Upload setup --------------------
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
// Profile photo storage
const photoStorage = multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
const uploadPhoto = multer({
    storage: photoStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ok = /jpeg|jpg|png|gif/i.test(file.mimetype);
        if (ok)
            cb(null, true);
        else
            cb(new Error("Only image files are allowed"));
    },
});
// Verification uploads
const verificationDir = path.join(uploadsDir, "verification");
if (!fs.existsSync(verificationDir)) {
    fs.mkdirSync(verificationDir, { recursive: true });
}
const verificationStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, verificationDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const playerId = req.session?.playerId || "anonymous";
        cb(null, `player-${playerId}-${Date.now()}${ext}`);
    },
});
const allowedVerificationMimeTypes = [
    "video/mp4",
    "video/quicktime",
    "image/jpeg",
    "image/png",
    "application/pdf",
];
const uploadVerification = multer({
    storage: verificationStorage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!allowedVerificationMimeTypes.includes(file.mimetype)) {
            return cb(new Error("Invalid file type"));
        }
        cb(null, true);
    },
});
// -------------------- Auth middlewares --------------------
function isAuthenticated(req, res, next) {
    if (req.session && req.session.playerId)
        return next();
    return res.status(401).json({ message: "Unauthorized" });
}
async function isAdmin(req, res, next) {
    if (!req.session || !req.session.playerId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getPlayer(req.session.playerId);
    const isAdminFlag = user?.is_admin || user?.isAdmin;
    if (!user || !isAdminFlag) {
        return res
            .status(403)
            .json({ message: "Forbidden - Admin access required" });
    }
    req.user = user;
    next();
}
// -------------------- Routes --------------------
export async function registerRoutes(app) {
    // -------- AUTH: Signup with ATP verification --------
    app.post("/api/auth/signup", uploadPhoto.single("photo"), async (req, res) => {
        try {
            const raw = req.body || {};
            const normalized = {
                email: String(raw.email || "").trim().toLowerCase(),
                password: String(raw.password || ""),
                fullName: String(raw.fullName || "").trim(),
                age: raw.age === "" || raw.age === undefined
                    ? undefined
                    : Number.parseInt(String(raw.age), 10),
                country: String(raw.country || "").trim(),
                location: String(raw.location || "").trim(),
                ranking: raw.ranking === undefined || raw.ranking === ""
                    ? null
                    : String(raw.ranking),
                specialization: String(raw.specialization || "").trim(),
                bio: String(raw.bio || "").trim(),
                fundingGoals: String(raw.fundingGoals || "").trim(),
                videoUrl: String(raw.videoUrl || "").trim(),
                // 🔴 always a string to match schema
                atpProfileUrl: String(raw.atpProfileUrl || "").trim(),
            };
            const parsed = signupPlayerSchema.safeParse(normalized);
            if (!parsed.success) {
                console.error("Signup validation failed:", parsed.error.issues);
                return res.status(400).json({
                    message: "Invalid input",
                    errors: parsed.error.issues.map((i) => ({
                        path: i.path.join("."), // e.g. "videoUrl"
                        message: i.message, // e.g. "Video link is required"
                    })),
                });
            }
            const data = parsed.data;
            const existing = await storage.getPlayerByEmail(data.email);
            if (existing) {
                return res
                    .status(400)
                    .json({ message: "Email already registered" });
            }
            const passwordHash = await bcrypt.hash(data.password, 10);
            const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
            // ATP AUTO-VERIFICATION
            let atpVerificationResult = null;
            let atpVerified = false;
            let atpScore = 0;
            if (data.atpProfileUrl) {
                console.log("🔍 Running ATP verification for:", data.fullName);
                const nameParts = data.fullName.trim().split(" ");
                const firstName = nameParts[0];
                const lastName = nameParts.slice(1).join(" ") || nameParts[0];
                try {
                    atpVerificationResult = await verifyPlayerAgainstATP({
                        firstName,
                        lastName,
                        country: data.country,
                        age: data.age,
                        atpProfileUrl: data.atpProfileUrl,
                    });
                    atpVerified = atpVerificationResult.verified;
                    atpScore = atpVerificationResult.score;
                    console.log("✅ ATP Verification Result:", {
                        verified: atpVerified,
                        score: atpScore,
                        discrepancies: atpVerificationResult.discrepancies,
                    });
                }
                catch (error) {
                    console.error("❌ ATP verification failed:", error);
                }
            }
            const toCreate = {
                email: data.email,
                passwordHash,
                fullName: data.fullName,
                age: data.age,
                country: data.country,
                location: data.location,
                ranking: data.ranking ?? null,
                specialization: data.specialization,
                bio: data.bio,
                fundingGoals: data.fundingGoals,
                videoUrl: data.videoUrl ? data.videoUrl : null,
                atpProfileUrl: data.atpProfileUrl ?? null,
                photoUrl,
                published: false,
                featured: false,
                priority: 0,
                active: true,
                // ATP Verification fields
                atpVerified,
                atpVerificationScore: atpScore,
                atpVerificationData: atpVerificationResult
                    ? JSON.stringify(atpVerificationResult)
                    : null,
                atpFirstNameMatch: atpVerificationResult?.matches?.firstName || false,
                atpLastNameMatch: atpVerificationResult?.matches?.lastName || false,
                atpCountryMatch: atpVerificationResult?.matches?.country || false,
                atpAgeMatch: atpVerificationResult?.matches?.age || false,
                atpDiscrepancies: atpVerificationResult?.discrepancies
                    ? JSON.stringify(atpVerificationResult.discrepancies)
                    : null,
                atpLastChecked: new Date(),
                atpCurrentRanking: atpVerificationResult?.atpData?.currentRanking || null,
            };
            const player = await storage.createPlayer(toCreate);
            const atpStatusHtml = atpVerificationResult
                ? `
        <div style="background: white; padding: 20px; margin: 20px 0; border-left: 4px solid ${atpVerified ? "#10b981" : "#f59e0b"};">
          <h3>ATP Verification Results</h3>
          <p><strong>Status:</strong> ${atpVerified ? "✅ AUTO-VERIFIED" : "⚠️ NEEDS REVIEW"}</p>
          <p><strong>Score:</strong> ${atpScore}/100</p>
          <ul>
            <li>First Name: ${atpVerificationResult.matches.firstName ? "✅" : "❌"}</li>
            <li>Last Name: ${atpVerificationResult.matches.lastName ? "✅" : "❌"}</li>
            <li>Country: ${atpVerificationResult.matches.country ? "✅" : "❌"}</li>
            <li>Age: ${atpVerificationResult.matches.age ? "✅" : "❌"}</li>
          </ul>
          ${atpVerificationResult.discrepancies.length > 0
                    ? `
            <p><strong>Issues:</strong></p>
            <ul>${atpVerificationResult.discrepancies
                        .map((d) => `<li>${d}</li>`)
                        .join("")}</ul>
          `
                    : ""}
        </div>
      `
                : "";
            await emailService.notifyAdminNewPlayer({
                fullName: data.fullName,
                email: data.email,
                location: data.location,
                ranking: data.ranking || undefined,
                specialization: data.specialization,
                atpStatusHtml,
            });
            req.session.playerId = player.id;
            res.json({
                player: {
                    ...player,
                    password_hash: undefined,
                    passwordHash: undefined,
                },
            });
        }
        catch (e) {
            console.error("Signup error:", e);
            res.status(500).json({ message: "Failed to create account" });
        }
    });
    // -------- AUTH: Signin --------
    app.post("/api/auth/signin", async (req, res) => {
        try {
            const body = req.body || {};
            const email = body.email;
            const password = body.password;
            if (!email || !password) {
                return res
                    .status(400)
                    .json({ message: "Email and password are required" });
            }
            const player = await storage.getPlayerByEmail(String(email).toLowerCase());
            if (!player) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const hash = player.password_hash || player.passwordHash;
            if (!hash) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const ok = await bcrypt.compare(String(password), String(hash));
            if (!ok) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            req.session.playerId = player.id;
            res.json({
                player: {
                    id: player.id,
                    email: player.email,
                    fullName: player.fullName,
                    age: player.age,
                    country: player.country,
                    location: player.location,
                    ranking: player.ranking,
                    specialization: player.specialization,
                    bio: player.bio,
                    fundingGoals: player.fundingGoals,
                    videoUrl: player.videoUrl,
                    photoUrl: player.photoUrl,
                    published: player.published,
                    featured: player.featured,
                    priority: player.priority,
                    isAdmin: player.isAdmin,
                    approvalStatus: player.approvalStatus,
                    approvedBy: player.approvedBy,
                    approvedAt: player.approvedAt,
                    createdAt: player.createdAt,
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
        if (!req.session)
            return res.json({ message: "Logged out" });
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: "Failed to logout" });
            }
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
                fullName: p.fullName,
                age: p.age,
                country: p.country,
                location: p.location,
                ranking: p.ranking,
                specialization: p.specialization,
                bio: p.bio,
                fundingGoals: p.fundingGoals,
                videoUrl: p.videoUrl,
                photoUrl: p.photoUrl,
                published: p.published,
                featured: p.featured,
                priority: p.priority,
                isAdmin: p.isAdmin,
                approvalStatus: p.approvalStatus,
                approvedBy: p.approvedBy,
                approvedAt: p.approvedAt,
                createdAt: p.createdAt,
                active: p.active,
                stripeAccountId: p.stripeAccountId,
                stripeReady: p.stripeReady,
            });
        }
        catch (e) {
            console.error("/api/auth/me error:", e);
            res.status(500).json({ message: "Failed to get player" });
        }
    });
    // -------- PUBLIC: Browse players --------
    // -------- PUBLIC: Browse players --------
    app.get("/api/players", async (_req, res) => {
        try {
            const list = await storage.getPublishedPlayers();
            const transformed = list
                .filter((p) => p.active !== false)
                .map((p) => ({
                id: p.id,
                fullName: p.fullName,
                location: p.location,
                ranking: p.ranking,
                specialization: p.specialization,
                bio: p.bio,
                fundingGoals: p.fundingGoals,
                videoUrl: p.videoUrl,
                photoUrl: p.photoUrl,
                country: p.country,
                age: p.age,
                // NEW: expose verification info to the frontend
                atpProfileUrl: p.atpProfileUrl,
                atpVerified: p.atpVerified,
                atpVerificationScore: p.atpVerificationScore,
            }));
            res.json(transformed);
        }
        catch (e) {
            console.error("Get players error:", e);
            res.status(500).json({ message: "Failed to get players" });
        }
    });
    // -------- PUBLIC: Get single player --------
    app.get("/api/players/:id", async (req, res) => {
        try {
            // DON'T force Number() here – some setups use UUIDs
            const rawId = req.params.id;
            const player = await storage.getPlayer(rawId);
            if (!player) {
                return res.status(404).json({ message: "Player not found" });
            }
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
    // -------- PLAYER: Upload verification --------
    app.post("/api/verification/upload", isAuthenticated, uploadVerification.single("file"), async (req, res) => {
        try {
            const playerId = req.session.playerId;
            const method = req.body.method;
            if (!req.file) {
                return res.status(400).json({ error: "File is required" });
            }
            if (method !== "video" && method !== "tournament_doc") {
                return res.status(400).json({ error: "Invalid method" });
            }
            const relativePath = `/uploads/verification/${req.file.filename}`;
            if (method === "video") {
                await db
                    .update(players)
                    .set({
                    verificationMethod: "video",
                    videoUrl: relativePath,
                    videoVerified: false,
                    verificationStatus: "pending",
                })
                    .where(eq(players.id, Number(playerId)));
            }
            else {
                await db
                    .update(players)
                    .set({
                    verificationMethod: "tournament_doc",
                    tournamentDocUrl: relativePath,
                    tournamentDocVerified: false,
                    verificationStatus: "pending",
                })
                    .where(eq(players.id, Number(playerId)));
            }
            return res.json({ ok: true, method, fileUrl: relativePath });
        }
        catch (err) {
            console.error("verification upload error", err);
            return res.status(500).json({ error: "Upload failed" });
        }
    });
    // -------- ADMIN: Get all players --------
    app.get("/api/admin/players", isAdmin, async (_req, res) => {
        try {
            const playersList = await storage.getAllPlayers();
            res.json(playersList);
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
            if (!player) {
                return res.status(404).json({ message: "Player not found" });
            }
            await db
                .update(players)
                .set({
                verificationStatus: "approved",
                verifiedAt: new Date(),
            })
                .where(eq(players.id, Number(req.params.id)));
            await emailService.notifyPlayerApproved({
                fullName: player.fullName,
                email: player.email,
            });
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
            if (!player) {
                return res.status(404).json({ message: "Player not found" });
            }
            const reason = (req.body && req.body.reason) || "Not approved";
            await db
                .update(players)
                .set({
                verificationStatus: "rejected",
                verificationNotes: reason,
            })
                .where(eq(players.id, Number(req.params.id)));
            await emailService.notifyPlayerRejected({
                fullName: player.fullName,
                email: player.email,
            });
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
            if (!player) {
                return res.status(404).json({ message: "Player not found" });
            }
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
            if (!player) {
                return res.status(404).json({ message: "Player not found" });
            }
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
    // -------- PAYMENTS: Stripe Connect onboarding --------
    app.post("/api/payments/stripe/connect-link", isAuthenticated, async (req, res) => {
        try {
            const playerId = req.session.playerId;
            const player = await storage.getPlayer(playerId);
            if (!player) {
                return res.status(404).json({ message: "Player not found" });
            }
            if (player.approvalStatus !== "approved") {
                return res
                    .status(400)
                    .json({ message: "Profile must be approved before connecting Stripe" });
            }
            const account = await stripeHelpers.createOrGetExpressAccount({
                playerId: player.id,
                fullName: player.fullName,
                email: player.email,
                country: player.country,
                existingAccountId: player.stripeAccountId,
            });
            // Save account id if new
            if (account.id !== player.stripeAccountId) {
                await db
                    .update(players)
                    .set({ stripeAccountId: account.id })
                    .where(eq(players.id, Number(playerId)));
            }
            const url = await stripeHelpers.createOnboardingLink(account.id);
            res.json({ url });
        }
        catch (e) {
            console.error("Stripe connect-link error:", e);
            res
                .status(500)
                .json({ message: e.message || "Failed to create Stripe onboarding link" });
        }
    });
    app.get("/api/payments/stripe/status", isAuthenticated, async (req, res) => {
        try {
            const playerId = req.session.playerId;
            const player = await storage.getPlayer(playerId);
            if (!player || !player.stripeAccountId) {
                return res.json({ ready: false, hasAccount: false });
            }
            const status = await stripeHelpers.getPayoutStatus(player.stripeAccountId);
            // If Stripe says we're ready, mark in DB
            if (status.ready && !player.stripeReady) {
                await db
                    .update(players)
                    .set({ stripeReady: true })
                    .where(eq(players.id, Number(playerId)));
            }
            res.json({
                ready: status.ready,
                hasAccount: true,
                chargesEnabled: status.chargesEnabled,
                payoutsEnabled: status.payoutsEnabled,
                detailsSubmitted: status.detailsSubmitted,
            });
        }
        catch (e) {
            console.error("Stripe status error:", e);
            res.status(500).json({
                message: e.message || "Failed to fetch Stripe status",
            });
        }
    });
    const httpServer = createServer(app);
    return httpServer;
}

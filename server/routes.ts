// --- FULL, FIXED VERSION ---
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import { storage } from "./storage.js";
import { signupPlayerSchema } from "../shared/schema.js";

// --- Session type augmentation ---
declare module "express-session" {
  interface SessionData {
    playerId?: string;
    user?: any;
  }
}

// -------------------- Helpers / setup --------------------
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

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
    if (ok) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session?.playerId) return next();
  return res.status(401).json({ message: "Unauthorized" });
}

async function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.playerId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user: any = await storage.getPlayer(req.session.playerId);
  const isAdminFlag = user?.is_admin || user?.isAdmin;
  if (!user || !isAdminFlag) {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  (req as any).user = user;
  next();
}

// -------------------- Routes --------------------
export async function registerRoutes(app: Express): Promise<Server> {
  // -------- AUTH: Signup --------
  app.post(
    "/api/auth/signup",
    upload.single("photo"),
    async (req: Request, res: Response) => {
      try {
        // Normalize raw form values
        const raw = req.body ?? {};
        const normalized = {
          email: String(raw.email ?? "").trim().toLowerCase(),
          password: String(raw.password ?? ""),
          fullName: String(raw.fullName ?? "").trim(),
          // allow "" -> undefined so zod can show a clean error if truly missing
          age:
            raw.age === "" || raw.age === undefined
              ? undefined
              : Number.parseInt(String(raw.age), 10),
          country: String(raw.country ?? "").trim(),
          location: String(raw.location ?? "").trim(),
          ranking:
            raw.ranking === undefined || raw.ranking === ""
              ? null
              : String(raw.ranking), // DB column is text; keep as string
          specialization: String(raw.specialization ?? "").trim(),
          bio: String(raw.bio ?? "").trim(),
          fundingGoals: String(raw.fundingGoals ?? "").trim(),
          videoUrl: String(raw.videoUrl ?? "").trim(), // schema allows "" or valid URL
          atpProfileUrl:
            raw.atpProfileUrl === undefined || raw.atpProfileUrl === ""
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
        } as const;

        const player = await storage.createPlayer(toCreate as any);

        req.session!.playerId = player.id;
        // never return password hashes
        res.json({ player: { ...player, password_hash: undefined, passwordHash: undefined } });
      } catch (e) {
        console.error("Signup error:", e);
        res.status(500).json({ message: "Failed to create account" });
      }
    }
  );

  // -------- AUTH: Signin --------
  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body ?? {};
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const player: any = await storage.getPlayerByEmail(String(email).toLowerCase());
      if (!player) return res.status(401).json({ message: "Invalid credentials" });

      const hash = player.password_hash || player.passwordHash;
      if (!hash) return res.status(401).json({ message: "Invalid credentials" });

      const ok = await bcrypt.compare(String(password), String(hash));
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });

      req.session!.playerId = player.id;
      res.json({
        player: {
          id: player.id,
          email: player.email,
          fullName: player.full_name,
          age: player.age,
          country: player.country,
          location: player.location,
          ranking: player.ranking,
          specialization: player.specialization,
          bio: player.bio,
          fundingGoals: player.funding_goals,
          videoUrl: player.video_url,
          photoUrl: player.photo_url,
          published: player.published,
          featured: player.featured,
          priority: player.priority,
          isAdmin: player.is_admin,
          approvalStatus: player.approval_status,
          approvedBy: player.approved_by,
          approvedAt: player.approved_at,
          createdAt: player.created_at,
          active: player.active,
        },
      });
    } catch (e) {
      console.error("Signin error:", e);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  // -------- AUTH: Logout --------
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session?.destroy((err) => {
      if (err) return res.status(500).json({ message: "Failed to logout" });
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  // -------- AUTH: Me --------
  app.get("/api/auth/me", isAuthenticated, async (req: Request, res: Response) => {
    try {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      const p: any = await storage.getPlayer(req.session!.playerId!);
      if (!p) return res.status(404).json({ message: "Player not found" });

      res.json({
  id: p.id,
  email: p.email,
  fullName: p.full_name,
  age: p.age,
  country: p.country,
  location: p.location,
  ranking: p.ranking,
  specialization: p.specialization,
  bio: p.bio,
  fundingGoals: p.funding_goals,
  videoUrl: p.video_url,
  photoUrl: p.photo_url,
  published: p.published,
  featured: p.featured,
  priority: p.priority,
  isAdmin: p.is_admin,
  approvalStatus: p.approval_status,
  approvedBy: p.approved_by,
  approvedAt: p.approved_at,
  createdAt: p.created_at,
  active: p.active,
});

    } catch (e) {
      console.error("/api/auth/me error:", e);
      res.status(500).json({ message: "Failed to get player" });
    }
  });

  // -------- PUBLIC: Browse players --------
  app.get("/api/players", async (_req: Request, res: Response) => {
    try {
      const list: any[] = await storage.getPublishedPlayers();
      const transformed = list
        .filter((p: any) => p.active !== false)
       .map((p: any) => ({
   id: p.id,
  fullName: p.full_name,          // ✅ CORRECT
  location: p.location,
  ranking: p.ranking,
  specialization: p.specialization,
  bio: p.bio,
  fundingGoals: p.funding_goals,  // ✅ CORRECT
  videoUrl: p.video_url,          // ✅ CORRECT
  photoUrl: p.photo_url,          // ✅ CORRECT
  country: p.country,
  age: p.age,
}));

      res.json(transformed);
    } catch (e) {
      console.error("Get players error:", e);
      res.status(500).json({ message: "Failed to get players" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

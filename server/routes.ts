// --- FULL, FIXED VERSION WITH VERIFICATION UPLOAD ---

import { emailService } from "./email.js";
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import { storage } from "./storage.js";
import { signupPlayerSchema } from "../shared/schema.js";
import { players } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { db } from "./storage.js";

// --- Session type augmentation ---
declare module "express-session" {
  interface SessionData {
    playerId?: string;
    user?: any;
  }
}

// -------------------- Helpers / setup --------------------

// Main uploads dir (used for profile photos)
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Profile photo storage (images only)
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
    if (ok) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// --- Verification uploads (video or document) ---
const verificationDir = path.join(uploadsDir, "verification");
if (!fs.existsSync(verificationDir)) {
  fs.mkdirSync(verificationDir, { recursive: true });
}

const verificationStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, verificationDir);
  },
  filename: (req: any, file, cb) => {
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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (_req, file, cb) => {
    if (!allowedVerificationMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  },
});

// --- Auth helpers ---
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
    return res
      .status(403)
      .json({ message: "Forbidden - Admin access required" });
  }
  (req as any).user = user;
  next();
}

// -------------------- Routes --------------------
export async function registerRoutes(app: Express): Promise<Server> {
  // -------- AUTH: Signup --------
  app.post(
    "/api/auth/signup",
    uploadPhoto.single("photo"),
    async (req: Request, res: Response) => {
      try {
        // Normalize raw form values
        const raw = req.body ?? {};
        const normalized = {
          email: String(raw.email ?? "").trim().toLowerCase(),
          password: String(raw.password ?? ""),
          fullName: String(raw.fullName ?? "").trim(),
          age:
            raw.age === "" || raw.age === undefined
              ? undefined
              : Number.parseInt(String(raw.age), 10),
          country: String(raw.country ?? "").trim(),
          location: String(raw.location ?? "").trim(),
          ranking:
            raw.ranking === undefined || raw.ranking === ""
              ? null
              : String(raw.ranking),
          specialization: String(raw.specialization ?? "").trim(),
          bio: String(raw.bio ?? "").trim(),
          fundingGoals: String(raw.fundingGoals ?? "").trim(),
          videoUrl: String(raw.videoUrl ?? "").trim(),
          atpProfileUrl:
            raw.atpProfileUrl === undefined || raw.atpProfileUrl === ""
              ? undefined
              : String(raw.atpProfileUrl).trim(),
        };

        const parsed = signupPlayerSchema.safeParse(normalized);
        if (!parsed.success) {
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

        // Build payload for storage.createPlayer
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
        } as const;

        const player = await storage.createPlayer(toCreate as any);

        // Send notification to admin
        await emailService.notifyAdminNewPlayer({
          fullName: data.fullName,
          email: data.email,
          location: data.location,
          ranking: data.ranking || undefined,
          specialization: data.specialization,
        });

        req.session!.playerId = player.id;

        res.json({
          player: { ...player, password_hash: undefined, passwordHash: undefined },
        });
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
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const player: any = await storage.getPlayerByEmail(
        String(email).toLowerCase()
      );
      if (!player)
        return res.status(401).json({ message: "Invalid credentials" });

      const hash = player.password_hash || player.passwordHash;
      if (!hash)
        return res.status(401).json({ message: "Invalid credentials" });

      const ok = await bcrypt.compare(String(password), String(hash));
      if (!ok) return res.status(401).

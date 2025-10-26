// --- TYPE FIXED VERSION ---
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { signupPlayerSchema } from "@shared/schema";

// --- Fix missing types ---
declare module "express-session" {
  interface SessionData {
    playerId?: string;
    user?: any;
  }
}

// ---- Helpers / setup

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// File upload (photo)
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

// Auth middlewares
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

// ---- Routes ----
export async function registerRoutes(app: Express): Promise<Server> {
  // AUTH
  app.post("/api/auth/signup", upload.single("photo"), async (req: Request, res: Response) => {
    try {
      const parsed = {
        ...req.body,
        age: req.body.age ? parseInt(req.body.age, 10) : undefined,
        ranking: req.body.ranking ? parseInt(req.body.ranking, 10) : undefined,
      };
      const result = signupPlayerSchema.safeParse(parsed);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: (result as any).error?.errors || [],
        });
      }

      const { email, password, atpProfileUrl, ...rest } = result.data;
      const existing = await storage.getPlayerByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const player = await storage.createPlayer({
        ...rest,
        email,
        passwordHash,
        atpProfileUrl: atpProfileUrl || null,
        photoUrl: photoUrl || null,
        published: false,
        featured: false,
        priority: "normal",
      });

      req.session!.playerId = player.id;
      res.json({ player: { ...player, passwordHash: undefined } });
    } catch (e) {
      console.error("Signup error:", e);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const player: any = await storage.getPlayerByEmail(email);
      if (!player) return res.status(401).json({ message: "Invalid credentials" });

      const hash = player.password_hash || player.passwordHash;
      if (!hash) return res.status(401).json({ message: "Invalid credentials" });

      const ok = await bcrypt.compare(password, hash);
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

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session?.destroy((err) => {
      if (err) return res.status(500).json({ message: "Failed to logout" });
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

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

  // PUBLIC: Browse players
  app.get("/api/players", async (_req: Request, res: Response) => {
    try {
      const list: any[] = await storage.getPublishedPlayers();
      const transformed = list
        .filter((p: any) => p.active !== false)
        .map((p: any) => ({
          id: p.id,
          fullName: p.full_name,
          location: p.location,
          ranking: p.ranking,
          specialization: p.specialization,
          bio: p.bio,
          fundingGoals: p.funding_goals,
          videoUrl: p.video_url,
          photoUrl: p.photo_url,
          country: p.country,
          age: p.age,
        }));
      res.json(transformed);
    } catch (e) {
      console.error("Get players error:", e);
      res.status(500).json({ message: "Failed to get players" });
    }
  });

  // Other routes below unchanged...
  // (keep your existing admin and upload routes — they’re fine)
  const httpServer = createServer(app);
  return httpServer;
}
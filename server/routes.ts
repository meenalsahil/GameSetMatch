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
  const user = await storage.getPlayer(req.session.playerId);
  const isAdminFlag = user?.is_admin || (user as any)?.isAdmin;
  if (!user || !isAdminFlag) {
    return res
      .status(403)
      .json({ message: "Forbidden - Admin access required" });
  }
  (req as any).user = user;
  next();
}

// ---- Routes

export async function registerRoutes(app: Express): Promise<Server> {
  // AUTH
  app.post("/api/auth/signup", upload.single("photo"), async (req, res) => {
    try {
      // Coerce numeric fields (because FormData sends strings)
      const parsed = {
        ...req.body,
        age: req.body.age ? parseInt(req.body.age, 10) : undefined,
        ranking: req.body.ranking ? parseInt(req.body.ranking, 10) : undefined,
      };
      const result = signupPlayerSchema.safeParse(parsed);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: result.error.errors,
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

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      const player = await storage.getPlayerByEmail(email);
      if (!player)
        return res.status(401).json({ message: "Invalid credentials" });

      const hash =
        (player as any).password_hash || (player as any).passwordHash;
      if (!hash)
        return res.status(401).json({ message: "Invalid credentials" });

      const ok = await bcrypt.compare(password, hash);
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });

      req.session!.playerId = player.id;
      res.json({
        player: {
          id: player.id,
          email: player.email,
          fullName: (player as any).full_name,
          age: player.age,
          country: player.country,
          location: player.location,
          ranking: player.ranking,
          specialization: player.specialization,
          bio: player.bio,
          fundingGoals: (player as any).funding_goals,
          videoUrl: (player as any).video_url,
          photoUrl: (player as any).photo_url,
          published: (player as any).published,
          featured: (player as any).featured,
          priority: (player as any).priority,
          isAdmin: (player as any).is_admin,
          approvalStatus: (player as any).approval_status,
          approvedBy: (player as any).approved_by,
          approvedAt: (player as any).approved_at,
          createdAt: (player as any).created_at,
          active: (player as any).active,
        },
      });
    } catch (e) {
      console.error("Signin error:", e);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) return res.status(500).json({ message: "Failed to logout" });
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, private",
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      const p = await storage.getPlayer(req.session!.playerId!);
      if (!p) return res.status(404).json({ message: "Player not found" });

      res.json({
        id: p.id,
        email: p.email,
        fullName: (p as any).full_name,
        age: p.age,
        country: p.country,
        location: p.location,
        ranking: p.ranking,
        specialization: p.specialization,
        bio: p.bio,
        fundingGoals: (p as any).funding_goals,
        videoUrl: (p as any).video_url,
        photoUrl: (p as any).photo_url,
        published: (p as any).published,
        featured: (p as any).featured,
        priority: (p as any).priority,
        isAdmin: (p as any).is_admin,
        approvalStatus: (p as any).approval_status,
        approvedBy: (p as any).approved_by,
        approvedAt: (p as any).approved_at,
        createdAt: (p as any).created_at,
        active: (p as any).active,
      });
    } catch (e) {
      console.error("/api/auth/me error:", e);
      res.status(500).json({ message: "Failed to get player" });
    }
  });

  // PUBLIC: Browse players (published + active only, camelCased)
  app.get("/api/players", async (_req, res) => {
    try {
      const list = await storage.getPublishedPlayers();
      const transformed = list
        .filter((p: any) => p.active !== false) // default true if null
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

  // Toggle active by the player themselves
  app.post("/api/players/toggle-active", isAuthenticated, async (req, res) => {
    try {
      const p = await storage.getPlayer(req.session!.playerId!);
      if (!p) return res.status(404).json({ message: "Player not found" });

      const updated =
        (p as any).active === false
          ? await storage.activatePlayer(p.id)
          : await storage.deactivatePlayer(p.id);

      res.json(updated);
    } catch (e) {
      console.error("Toggle active error:", e);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // ADMIN
  app.get("/api/admin/players", isAdmin, async (_req, res) => {
    try {
      const list = await storage.getAllPlayers();
      const transformed = list.map((p: any) => ({
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
      }));
      res.json(transformed);
    } catch (e) {
      console.error("Get admin players error:", e);
      res.status(500).json({ message: "Failed to get players" });
    }
  });

  app.post("/api/admin/players/:id/approve", isAdmin, async (req, res) => {
    try {
      const adminId = (req as any).user.id;
      const p = await storage.approvePlayer(req.params.id, adminId);
      if (!p) return res.status(404).json({ message: "Player not found" });
      res.json({ message: "Approved", player: p });
    } catch (e) {
      console.error("Approve player error:", e);
      res.status(500).json({ message: "Failed to approve player" });
    }
  });

  app.post("/api/admin/players/:id/reject", isAdmin, async (req, res) => {
    try {
      const adminId = (req as any).user.id;
      const p = await storage.rejectPlayer(req.params.id, adminId);
      if (!p) return res.status(404).json({ message: "Player not found" });
      res.json({ message: "Rejected", player: p });
    } catch (e) {
      console.error("Reject player error:", e);
      res.status(500).json({ message: "Failed to reject player" });
    }
  });

  app.post("/api/admin/players/:id/deactivate", isAdmin, async (req, res) => {
    try {
      const p = await storage.deactivatePlayer(req.params.id);
      if (!p) return res.status(404).json({ message: "Player not found" });
      res.json({ message: "Deactivated", player: p });
    } catch (e) {
      console.error("Deactivate player error:", e);
      res.status(500).json({ message: "Failed to deactivate player" });
    }
  });

  app.post("/api/admin/players/:id/activate", isAdmin, async (req, res) => {
    try {
      const p = await storage.activatePlayer(req.params.id);
      if (!p) return res.status(404).json({ message: "Player not found" });
      res.json({ message: "Activated", player: p });
    } catch (e) {
      console.error("Activate player error:", e);
      res.status(500).json({ message: "Failed to activate player" });
    }
  });

  app.delete("/api/admin/players/:id", isAdmin, async (req, res) => {
    try {
      await storage.deletePlayer(req.params.id);
      res.json({ message: "Player deleted" });
    } catch (e) {
      console.error("Delete player error:", e);
      res.status(500).json({ message: "Failed to delete player" });
    }
  });

  // file upload for signed-in player (optional)
  app.post(
    "/api/upload/photo",
    isAuthenticated,
    upload.single("photo"),
    async (req, res) => {
      try {
        if (!req.file)
          return res.status(400).json({ message: "No file uploaded" });
        const photoUrl = `/uploads/${req.file.filename}`;
        await storage.updatePlayer(req.session!.playerId!, { photoUrl });
        res.json({ photoUrl });
      } catch (e) {
        console.error("Upload photo error:", e);
        res.status(500).json({ message: "Failed to upload photo" });
      }
    },
  );

  // create & return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { signupPlayerSchema, type Player } from "@shared/schema";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";

// Middleware to check authentication
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session?.playerId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const result = signupPlayerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.errors });
      }

      const { email, password, ...playerData } = result.data;

      // Check if player already exists
      const existingPlayer = await storage.getPlayerByEmail(email);
      if (existingPlayer) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create player
      const player = await storage.createPlayer({
        ...playerData,
        email,
        passwordHash,
        published: false,
        featured: false,
        priority: "normal",
      });

      // Set session
      req.session!.playerId = player.id;

      res.json({ player: { ...player, passwordHash: undefined } });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;

      const player = await storage.getPlayerByEmail(email);
      if (!player) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, player.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session!.playerId = player.id;
      res.json({ player: { ...player, passwordHash: undefined } });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const player = await storage.getPlayer(req.session!.playerId!);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json({ ...player, passwordHash: undefined });
    } catch (error) {
      console.error("Get current player error:", error);
      res.status(500).json({ message: "Failed to get player" });
    }
  });

  // Player routes
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getPublishedPlayers();
      res.json(players.map(p => ({ ...p, passwordHash: undefined })));
    } catch (error) {
      console.error("Get players error:", error);
      res.status(500).json({ message: "Failed to get players" });
    }
  });

  app.get("/api/players/featured", async (req, res) => {
    try {
      const players = await storage.getFeaturedPlayers();
      res.json(players.map(p => ({ ...p, passwordHash: undefined })));
    } catch (error) {
      console.error("Get featured players error:", error);
      res.status(500).json({ message: "Failed to get featured players" });
    }
  });

  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json({ ...player, passwordHash: undefined });
    } catch (error) {
      console.error("Get player error:", error);
      res.status(500).json({ message: "Failed to get player" });
    }
  });

  app.patch("/api/players/:id", isAuthenticated, async (req, res) => {
    try {
      // Ensure player can only update their own profile
      if (req.session!.playerId !== req.params.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const player = await storage.updatePlayer(req.params.id, req.body);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json({ ...player, passwordHash: undefined });
    } catch (error) {
      console.error("Update player error:", error);
      res.status(500).json({ message: "Failed to update player" });
    }
  });

  app.post("/api/players/:id/publish", isAuthenticated, async (req, res) => {
    try {
      if (req.session!.playerId !== req.params.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const player = await storage.publishPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json({ ...player, passwordHash: undefined });
    } catch (error) {
      console.error("Publish player error:", error);
      res.status(500).json({ message: "Failed to publish player" });
    }
  });

  app.post("/api/upload/photo", isAuthenticated, upload.single("photo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const photoUrl = `/uploads/${req.file.filename}`;
      
      // Update player's photo
      if (req.session?.playerId) {
        await storage.updatePlayer(req.session.playerId, { photoUrl });
      }
      
      res.json({ photoUrl });
    } catch (error) {
      console.error("Upload photo error:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

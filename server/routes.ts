import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { signupPlayerSchema, type Player } from "@shared/schema";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";

// Middleware to check authentication
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session?.playerId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

async function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.playerId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const player = await storage.getPlayer(req.session.playerId);

  // FIX: Check both snake_case and camelCase
  const isAdminUser = player?.is_admin || player?.isAdmin;

  if (!player || !isAdminUser) {
    return res
      .status(403)
      .json({ message: "Forbidden - Admin access required" });
  }

  // Add user to request for later use
  req.user = player;
  next();
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
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
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
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.errors });
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

      console.log("/api/auth/signin - Player data:", player);

      if (!player) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const passwordHash = player.password_hash || player.passwordHash;

      if (!passwordHash) {
        console.error("No password hash found for player");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, passwordHash);

      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session and wait for it to save
      req.session!.playerId = player.id;

      try {
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              reject(err);
            } else {
              console.log("Session saved successfully, ID:", req.sessionID);
              resolve();
            }
          });
        });
      } catch (saveError) {
        console.error("Failed to save session:", saveError);
        return res.status(500).json({ message: "Failed to create session" });
      }

      // Wait a tiny bit for database to commit
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Return player data with camelCase for frontend
      const playerData = {
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
      };

      console.log("Sending response with player data");
      res.json({ player: playerData });
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

  app.get("/api/auth/test-session", (req, res) => {
    console.log("TEST SESSION:", req.session);
    res.json({
      hasSession: !!req.session,
      hasPlayerId: !!req.session?.playerId,
      playerId: req.session?.playerId,
      sessionID: req.sessionID,
      cookies: req.headers.cookie,
    });
  });

  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      console.log("/api/auth/me - Session:", req.session);
      const player = await storage.getPlayer(req.session!.playerId!);
      console.log("/api/auth/me - Player data:", player);

      if (!player) {
        console.log("/api/auth/me - Player not found");
        return res.status(404).json({ message: "Player not found" });
      }

      // FIX: Convert snake_case to camelCase
      const playerData = {
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
      };

      console.log("/api/auth/me - isAdmin:", playerData.isAdmin);
      res.json(playerData);
    } catch (error) {
      console.error("/api/auth/me - Get current player error:", error);
      res.status(500).json({ message: "Failed to get player" });
    }
  });

  // Player routes
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getPublishedPlayers();
      res.json(players.map((p) => ({ ...p, passwordHash: undefined })));
    } catch (error) {
      console.error("Get players error:", error);
      res.status(500).json({ message: "Failed to get players" });
    }
  });

  app.get("/api/players/featured", async (req, res) => {
    try {
      const players = await storage.getFeaturedPlayers();
      res.json(players.map((p) => ({ ...p, passwordHash: undefined })));
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
  // Admin routes
  app.get("/api/admin/players", async (req, res) => {
    try {
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const players = await storage.getAllPlayers();
      res.json(players.map((p) => ({ ...p, passwordHash: undefined })));
    } catch (error) {
      console.error("Get admin players error:", error);
      res.status(500).json({ message: "Failed to get players" });
    }
  });

  app.post("/api/admin/players/:id/approve", async (req, res) => {
    try {
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const player = await storage.approvePlayer(req.params.id, req.user.id);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      res.json({ ...player, passwordHash: undefined });
    } catch (error) {
      console.error("Approve player error:", error);
      res.status(500).json({ message: "Failed to approve player" });
    }
  });

  app.post("/api/admin/players/:id/reject", async (req, res) => {
    try {
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const player = await storage.rejectPlayer(req.params.id, req.user.id);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      res.json({ ...player, passwordHash: undefined });
    } catch (error) {
      console.error("Reject player error:", error);
      res.status(500).json({ message: "Failed to reject player" });
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

  app.post(
    "/api/upload/photo",
    isAuthenticated,
    upload.single("photo"),
    async (req, res) => {
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
    },
  );

  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, message } = req.body;

      if (!name || !email || !message) {
        return res
          .status(400)
          .json({ message: "Name, email, and message are required" });
      }

      // Check if email credentials are configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("Email credentials not configured");
        return res.status(500).json({
          message:
            "Email service is not configured. Please contact the administrator.",
        });
      }

      // Create email transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "suvirabeer@gmail.com",
        subject: `GameSetMatch Contact Form: ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr>
          <p><em>Reply to: ${email}</em></p>
        `,
      };

      // Send email
      await transporter.sendMail(mailOptions);

      res.json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Admin routes
  app.get("/api/admin/players", isAdmin, async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      // Remove password hashes from response
      const sanitizedPlayers = players.map((p) => ({
        ...p,
        passwordHash: undefined,
      }));
      res.json(sanitizedPlayers);
    } catch (error) {
      console.error("Get all players error:", error);
      res.status(500).json({ message: "Failed to get players" });
    }
  });

  app.delete("/api/admin/players/:id", isAdmin, async (req, res) => {
    try {
      // Prevent admins from deleting themselves
      if (req.params.id === req.session!.playerId) {
        return res
          .status(403)
          .json({ message: "You cannot delete your own account" });
      }

      await storage.deletePlayer(req.params.id);
      res.json({ message: "Player deleted successfully" });
    } catch (error) {
      console.error("Delete player error:", error);
      res.status(500).json({ message: "Failed to delete player" });
    }
  });

  app.post("/api/admin/players/:id/approve", isAdmin, async (req, res) => {
    try {
      const adminId = req.session!.playerId!;
      const player = await storage.approvePlayer(req.params.id, adminId);

      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Send approval email
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: player.email,
            subject: "Your GameSetMatch Application Has Been Approved!",
            html: `
              <h2>Congratulations, ${player.fullName}!</h2>
              <p>Your application to join GameSetMatch has been approved!</p>
              <p>You can now complete your profile and publish it to start connecting with sponsors.</p>
              <p><a href="${req.protocol}://${req.get("host")}/signin">Sign in to your dashboard</a></p>
              <br>
              <p>Best regards,<br>The GameSetMatch Team</p>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send approval email:", emailError);
          // Don't fail the approval if email fails
        }
      }

      res.json({ player: { ...player, passwordHash: undefined } });
    } catch (error) {
      console.error("Approve player error:", error);
      res.status(500).json({ message: "Failed to approve player" });
    }
  });

  app.post("/api/admin/players/:id/reject", isAdmin, async (req, res) => {
    try {
      const adminId = req.session!.playerId!;
      const player = await storage.rejectPlayer(req.params.id, adminId);

      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Send rejection email
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: player.email,
            subject: "Update on Your GameSetMatch Application",
            html: `
              <h2>Hello ${player.fullName},</h2>
              <p>Thank you for your interest in GameSetMatch.</p>
              <p>After reviewing your application, we're unable to approve it at this time.</p>
              <p>If you have questions or would like to reapply in the future, please contact us.</p>
              <br>
              <p>Best regards,<br>The GameSetMatch Team</p>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send rejection email:", emailError);
          // Don't fail the rejection if email fails
        }
      }

      res.json({ player: { ...player, passwordHash: undefined } });
    } catch (error) {
      console.error("Reject player error:", error);
      res.status(500).json({ message: "Failed to reject player" });
    }
  });

  // Password recovery routes
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const player = await storage.getPlayerByEmail(email);
      if (!player) {
        // Don't reveal if email exists
        return res.json({
          message:
            "If an account with that email exists, a password reset link has been sent.",
        });
      }

      // Generate reset token
      const resetToken = randomUUID();
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

      await storage.createPasswordResetToken(player.id, resetToken, expiresAt);

      // Send email
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("Email credentials not configured");
        return res
          .status(500)
          .json({ message: "Email service is not configured" });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const resetUrl = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "GameSetMatch - Password Reset Request",
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${player.fullName},</p>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr>
          <p><em>GameSetMatch Team</em></p>
        `,
      });

      res.json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res
        .status(500)
        .json({ message: "Failed to process password reset request" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res
          .status(400)
          .json({ message: "Token and password are required" });
      }

      if (password.length < 8) {
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters" });
      }

      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }

      if (new Date() > resetToken.expiresAt) {
        await storage.deletePasswordResetToken(token);
        return res.status(400).json({ message: "Reset token has expired" });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(password, 10);

      // Update player password
      await storage.updatePlayer(resetToken.playerId, { passwordHash });

      // Delete used token
      await storage.deletePasswordResetToken(token);

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

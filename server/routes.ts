// server/routes.ts
import { playerStatsCache } from "../shared/schema.js"; // Ensure path matches your setup
import { incrementApiUsage, getApiUsage } from "./utils/usageTracker.js";
import OpenAI from "openai";
import { stripeHelpers, isStripeEnabled } from "./stripe.js";
import { and, eq } from "drizzle-orm";
import { emailService } from "./email.js";
import { Express, Request, Response, NextFunction } from "express";
import { createServer, Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage.js";
import { db, pool } from "./db.js";
import {
  players,
  signupPlayerSchema,
  type InsertPlayer,
} from "../shared/schema.js";
import { verifyPlayerAgainstATP } from "./atp-verification.js";


// -------------------- Session helpers --------------------
declare module "express-session" {
  interface SessionData {
    playerId?: number | string; // Can be number or UUID string
  }
}

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
    if (ok) cb(null, true);
    else cb(new Error("Only image files are allowed"));
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
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedVerificationMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  },
});

// -------------------- Auth middlewares --------------------
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.playerId) return next();
  return res.status(401).json({ message: "Unauthorized" });
}

async function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.playerId) {
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
  
  // ONE-TIME FIX: Mark all existing players as email verified
app.get("/api/admin/fix-email-verified", async (_req: Request, res: Response) => {
  try {
    await db.update(players).set({ emailVerified: true });
    res.json({ success: true, message: "All players marked as email verified" });
  } catch (e) {
    console.error("Fix error:", e);
    res.status(500).json({ message: "Failed" });
  }
});

// --- KNOWN PLAYERS REGISTRY ---

// ADMIN: Clear the known_players table
  app.delete("/api/admin/clear-known-players", async (_req: Request, res: Response) => {
    try {
      await pool.query("TRUNCATE TABLE known_players RESTART IDENTITY");
      res.json({ success: true, message: "Known players database cleared." });
    } catch (e: any) {
      console.error("Clear error:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // ADMIN: Seed the database with CSV text from your PDF
  app.post("/api/admin/seed-csv", async (req: Request, res: Response) => {
    try {
      const { gender, csvData } = req.body;
      
      if (!csvData || !gender) {
        return res.status(400).json({ message: "Missing data" });
      }

      // Ensure table exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS known_players (
          id SERIAL PRIMARY KEY,
          full_name TEXT NOT NULL,
          country TEXT,
          gender TEXT,
          birth_date DATE,
          source_id TEXT
        );
      `);

      // Parse the CSV content you pasted
      // Format: "Rank","Player","Country","Birthdate"
      // Example: "1","Aryna Sabalenka","BLR","1998-05-05"
      const rows = csvData.split("\n");
      let count = 0;

      for (const row of rows) {
        // Remove quotes and split
        const cleanRow = row.replace(/"/g, "").trim();
        if (!cleanRow) continue;
        
        const cols = cleanRow.split(",");
        // We expect at least 4 columns. 
        // cols[1] is Name, cols[2] is Country Code, cols[3] is DOB
        
        if (cols.length >= 4) {
          const name = cols[1].trim();
          const countryCode = cols[2].trim();
          const dob = cols[3].trim(); // 1998-05-05

          // Basic validation
          if (name && name !== "Player" && dob.includes("-")) {
             await pool.query(
              `INSERT INTO known_players (full_name, country, gender, birth_date) 
               VALUES ($1, $2, $3, $4)
               ON CONFLICT DO NOTHING`, // Prevent duplicates if run twice
              [name, countryCode, gender, dob]
            );
            count++;
          }
        }
      }

      res.json({ success: true, message: `Successfully seeded ${count} ${gender} players.` });
    } catch (e: any) {
      console.error("Seeding error:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // SEARCH: Smart Lookup for Signup
  app.get("/api/players/lookup", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) return res.json([]);

      // Case-insensitive search
      const result = await pool.query(
        `SELECT full_name, country, gender, birth_date 
         FROM known_players 
         WHERE full_name ILIKE $1 
         LIMIT 10`,
        [`%${query}%`]
      );

      // Helper map for Country Codes -> Full Names
      const countryMap: Record<string, string> = {
        "USA": "United States", "GBR": "United Kingdom", "ESP": "Spain",
        "FRA": "France", "ITA": "Italy", "GER": "Germany", "AUS": "Australia",
        "ARG": "Argentina", "CAN": "Canada", "CHN": "China", "JPN": "Japan",
        "RUS": "Russia", "SUI": "Switzerland", "CZE": "Czech Republic",
        "BRA": "Brazil", "POL": "Poland", "SRB": "Serbia", "CRO": "Croatia"
        // Add more if needed, otherwise it sends the code
      };

      const players = result.rows.map(p => {
        let age = null;
        if (p.birth_date) {
          const birth = new Date(p.birth_date);
          const today = new Date();
          age = today.getFullYear() - birth.getFullYear();
        }
        
        return {
          fullName: p.full_name,
          country: countryMap[p.country] || p.country, // Convert code if possible
          gender: p.gender === 'Male' ? 'male' : 'female',
          age: age
        };
      });

      res.json(players);
    } catch (e) {
      console.error("Lookup error:", e);
      res.json([]);
    }
  });

app.get("/api/admin/add-player-fields", async (_req: Request, res: Response) => {
  try {
    await pool.query(`
      ALTER TABLE players 
      ADD COLUMN IF NOT EXISTS gender TEXT,
      ADD COLUMN IF NOT EXISTS play_style TEXT
    `);
    res.json({ success: true, message: "gender and play_style columns added" });
  } catch (e: any) {
    console.error("Migration error:", e);
    res.status(500).json({ message: e.message });
  }
});

app.get("/api/admin/update-sponsor-count", async (_req: Request, res: Response) => {
  try {
    // Update Family Tennis sponsor count (or use actual player ID)
    await pool.query(`
      UPDATE players 
      SET sponsor_count = 1 
      WHERE full_name ILIKE '%Family Tennis%'
    `);
    res.json({ success: true, message: "Sponsor count updated" });
  } catch (e: any) {
    console.error("Update error:", e);
    res.status(500).json({ message: e.message });
  }
});

app.get("/api/admin/add-sponsor-count", async (_req: Request, res: Response) => {
  try {
    await pool.query(`
      ALTER TABLE players 
      ADD COLUMN IF NOT EXISTS sponsor_count INTEGER DEFAULT 0
    `);
    res.json({ success: true, message: "sponsor_count column added" });
  } catch (e: any) {
    console.error("Migration error:", e);
    res.status(500).json({ message: e.message });
  }
});

// ONE-TIME: Add email verification columns if missing
  app.get("/api/admin/migrate-email-columns", async (_req: Request, res: Response) => {
    try {
      await pool.query(`
        ALTER TABLE players 
        ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
        ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP
      `);
      res.json({ success: true, message: "Email columns added" });
    } catch (e: any) {
      console.error("Migration error:", e);
      res.status(500).json({ message: e.message });
    }
  });
  // -------- AUTH: Signup with ATP verification + Email Verification --------
  app.post(
    "/api/auth/signup",
    uploadPhoto.single("photo"),
    async (req: Request, res: Response) => {
      try {
        const raw = req.body || {};
        const normalized = {
          email: String(raw.email || "").trim().toLowerCase(),
          password: String(raw.password || ""),
          fullName: String(raw.fullName || "").trim(),
          age:
            raw.age === "" || raw.age === undefined
              ? undefined
              : Number.parseInt(String(raw.age), 10),
         gender: String(raw.gender || "").trim(),
playStyle: String(raw.playStyle || "").trim(),
              country: String(raw.country || "").trim(),
          location: String(raw.location || "").trim(),
          ranking:
            raw.ranking === undefined || raw.ranking === ""
              ? null
              : String(raw.ranking),
          specialization: String(raw.specialization || "").trim(),
          bio: String(raw.bio || "").trim(),
          fundingGoals: String(raw.fundingGoals || "").trim(),
          videoUrl: String(raw.videoUrl || "").trim(),
          atpProfileUrl: String(raw.atpProfileUrl || "").trim(),
        };

        const parsed = signupPlayerSchema.safeParse(normalized);
        if (!parsed.success) {
          console.error("Signup validation failed:", parsed.error.issues);
          return res.status(400).json({
            message: "Invalid input",
            errors: parsed.error.issues.map((i) => ({
              path: i.path.join("."),
              message: i.message,
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

        // Generate email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString("hex");
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // ATP AUTO-VERIFICATION
        let atpVerificationResult: any = null;
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
          } catch (error) {
            console.error("❌ ATP verification failed:", error);
          }
        }

        const toCreate = {
          email: data.email,
          passwordHash,
          fullName: data.fullName,
          age: data.age,
         gender: data.gender || null,
playStyle: data.playStyle || null,
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

          // Email verification - NOT verified yet
          emailVerified: false,
          emailVerificationToken,
          emailVerificationExpires,

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
          atpCurrentRanking:
            atpVerificationResult?.atpData?.currentRanking || null,
        } as const;

        const player = await storage.createPlayer(toCreate as any);

        // Send verification email (NOT admin notification yet!)
        try {
          await emailService.sendVerificationEmail({
            fullName: data.fullName,
            email: data.email,
            verificationToken: emailVerificationToken,
          });
        } catch (emailError) {
          console.error("Failed to send verification email:", emailError);
          // Don't fail signup, but log the error
        }

        // DO NOT log them in yet - they need to verify email first
        // DO NOT notify admin yet - wait until email is verified

        res.json({
          success: true,
          message: "Please check your email to verify your account",
          requiresVerification: true,
          player: {
            id: player.id,
            email: player.email,
            fullName: player.fullName,
            emailVerified: false,
          },
        });
      } catch (e) {
        console.error("Signup error:", e);
        res.status(500).json({ message: "Failed to create account" });
      }
    },
  );

  // -------- AUTH: Verify Email --------
  app.get("/api/auth/verify-email/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }

      // Find player with this token
      const result = await db
        .select()
        .from(players)
        .where(eq(players.emailVerificationToken, token))
        .limit(1);

      const player = result[0];

      if (!player) {
        return res.status(400).json({ message: "Invalid or expired verification link" });
      }

      // Check if already verified
      if (player.emailVerified) {
        return res.json({ 
          success: true, 
          message: "Email already verified",
          alreadyVerified: true 
        });
      }

      // Check if token is expired
      if (player.emailVerificationExpires && new Date() > new Date(player.emailVerificationExpires)) {
        return res.status(400).json({ 
          message: "Verification link has expired. Please request a new one.",
          expired: true 
        });
      }

      // Mark email as verified
      await db
        .update(players)
        .set({
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        })
        .where(eq(players.id, player.id));

      // NOW notify admin about the new player (email is verified)
      const atpVerificationResult = player.atpVerificationData 
        ? (typeof player.atpVerificationData === 'string' 
            ? JSON.parse(player.atpVerificationData) 
            : player.atpVerificationData)
        : null;

      const atpStatusHtml = atpVerificationResult
        ? `
        <div style="background: white; padding: 20px; margin: 20px 0; border-left: 4px solid ${
          player.atpVerified ? "#10b981" : "#f59e0b"
        };">
          <h3>ATP Verification Results</h3>
          <p><strong>Status:</strong> ${
            player.atpVerified ? "✅ AUTO-VERIFIED" : "⚠️ NEEDS REVIEW"
          }</p>
          <p><strong>Score:</strong> ${player.atpVerificationScore || 0}/100</p>
        </div>
      `
        : "";

      await emailService.notifyAdminNewPlayer({
        fullName: player.fullName,
        email: player.email,
        location: player.location || "",
        ranking: player.ranking?.toString(),
        specialization: player.specialization || "",
        atpStatusHtml,
      });

      console.log("✅ Email verified for:", player.email);

      res.json({ 
        success: true, 
        message: "Email verified successfully! Your profile has been submitted for review." 
      });
    } catch (e) {
      console.error("Email verification error:", e);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  // -------- AUTH: Resend Verification Email --------
  app.post("/api/auth/resend-verification", async (req: Request, res: Response) => {
    try {
      const { email } = req.body || {};

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const player: any = await storage.getPlayerByEmail(String(email).toLowerCase());

      if (!player) {
        // Don't reveal if email exists or not for security
        return res.json({ 
          success: true, 
          message: "If an account exists with this email, a verification link has been sent." 
        });
      }

      if (player.emailVerified) {
        return res.status(400).json({ 
          message: "Email is already verified. You can sign in.",
          alreadyVerified: true 
        });
      }

      // Generate new token
      const emailVerificationToken = crypto.randomBytes(32).toString("hex");
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Update player with new token
      await db
        .update(players)
        .set({
          emailVerificationToken,
          emailVerificationExpires,
        })
        .where(eq(players.id, player.id));

      // Send new verification email
      await emailService.sendVerificationEmail({
        fullName: player.fullName,
        email: player.email,
        verificationToken: emailVerificationToken,
      });

      res.json({ 
        success: true, 
        message: "Verification email sent! Please check your inbox." 
      });
    } catch (e) {
      console.error("Resend verification error:", e);
      res.status(500).json({ message: "Failed to resend verification email" });
    }
  });

  // -------- ADMIN: Reset Stripe for any player (admin only) --------
  app.post(
    "/api/admin/reset-stripe/:playerId",
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        // Keep as string - don't convert to Number (UUIDs break with Number())
        const playerId = req.params.playerId;

        await db
          .update(players)
          .set({
            stripeAccountId: null,
            stripeReady: false,
          })
          .where(eq(players.id, playerId as any));

        res.json({ ok: true, message: "Stripe fields reset for player" });
      } catch (e: any) {
        console.error("Admin reset stripe error:", e);
        res.status(500).json({ message: e.message || "Failed to reset" });
      }
    },
  );

  // -------- PLAYER: Reset own Stripe account (any logged-in player) --------
  app.post(
    "/api/players/me/reset-stripe",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const playerId = req.session!.playerId!;

        // Get the player first to get their actual ID
        const player: any = await storage.getPlayer(playerId);
        if (!player) {
          return res.status(404).json({ message: "Player not found" });
        }

        // Use player.id directly (already the correct type)
        await db
          .update(players)
          .set({
            stripeAccountId: null,
            stripeReady: false,
          })
          .where(eq(players.id, player.id));

        console.log("✅ Player Stripe reset:", { playerId: player.id });

        res.json({ ok: true, message: "Your Stripe account has been reset" });
      } catch (e: any) {
        console.error("Player self-reset stripe error:", e);
        res.status(500).json({ message: e.message || "Failed to reset" });
      }
    },
  );


  // -------- AUTH: Signin --------
  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const email = body.email;
      const password = body.password;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const player: any = await storage.getPlayerByEmail(
        String(email).toLowerCase(),
      );
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

      // Check if email is verified
      if (!player.emailVerified) {
        return res.status(403).json({ 
          message: "Please verify your email before signing in",
          requiresVerification: true,
          email: player.email 
        });
      }

      req.session!.playerId = player.id;
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
          emailVerified: player.emailVerified,
        },
      });
    } catch (e) {
      console.error("Signin error:", e);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  // -------- AUTH: Logout --------
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    if (!req.session) return res.json({ message: "Logged out" });
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

// -------- AUTH: Me --------
  app.get(
    "/api/auth/me",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        res.setHeader(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, private",
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        const p: any = await storage.getPlayer(req.session!.playerId!);
        if (!p) return res.status(404).json({ message: "Player not found" });

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
          atpProfileUrl: p.atpProfileUrl,
          emailVerified: p.emailVerified,
          // FIX: Use 'p' instead of 'player'
          gender: p.gender,
          playStyle: p.playStyle || p.play_style,
        });
      } catch (e) {
        console.error("/api/auth/me error:", e);
        res.status(500).json({ message: "Failed to get player" });
      }
    },
  );

  // -------- PLAYER: Update own profile --------
  app.put(
    "/api/players/me",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const playerId = req.session!.playerId!;
        const body = req.body || {};

        // Normalize / coerce types
        const update: Partial<InsertPlayer> = {
          email:
            body.email === undefined ? undefined : String(body.email).trim(),
          fullName:
            body.fullName === undefined
              ? undefined
              : String(body.fullName).trim(),
          age:
            body.age === undefined || body.age === ""
              ? undefined
              : Number.parseInt(String(body.age), 10),
          country:
            body.country === undefined
              ? undefined
              : String(body.country).trim(),
          location:
            body.location === undefined
              ? undefined
              : String(body.location).trim(),
          ranking:
            body.ranking === undefined || body.ranking === ""
              ? undefined
              : Number.parseInt(String(body.ranking), 10),
          specialization:
            body.specialization === undefined
              ? undefined
              : String(body.specialization).trim(),
          bio:
            body.bio === undefined ? undefined : String(body.bio).trim(),
          fundingGoals:
            body.fundingGoals === undefined
              ? undefined
              : String(body.fundingGoals).trim(),
          videoUrl:
            body.videoUrl === undefined
              ? undefined
              : String(body.videoUrl).trim(),
          atpProfileUrl:
            body.atpProfileUrl === undefined
              ? undefined
              : String(body.atpProfileUrl).trim(),
          photoUrl:
            body.photoUrl === undefined
              ? undefined
              : String(body.photoUrl).trim(),
          
          // FIX: Don't use 'player.gender', just check body
          gender: body.gender === undefined ? undefined : String(body.gender).trim(),
          playStyle: body.playStyle === undefined ? undefined : String(body.playStyle).trim(),
        };

        const updated = await storage.updatePlayer(String(playerId), update);
        if (!updated) {
          return res.status(404).json({ message: "Player not found" });
        }

        // Return a safe subset
        res.json({
          id: updated.id,
          email: updated.email,
          fullName: updated.fullName,
          age: updated.age,
          country: updated.country,
          location: updated.location,
          ranking: updated.ranking,
          specialization: updated.specialization,
          bio: updated.bio,
          fundingGoals: updated.fundingGoals,
          videoUrl: updated.videoUrl,
          photoUrl: updated.photoUrl,
          published: updated.published,
          featured: updated.featured,
          priority: updated.priority,
          isAdmin: (updated as any).isAdmin,
          approvalStatus: (updated as any).approvalStatus,
          approvedBy: (updated as any).approvedBy,
          approvedAt: (updated as any).approvedAt,
          createdAt: (updated as any).createdAt,
          active: updated.active,
          stripeAccountId: (updated as any).stripeAccountId,
          stripeReady: (updated as any).stripeReady,
          gender: updated.gender,
          playStyle: updated.playStyle || (updated as any).play_style,
        });
      } catch (e) {
        console.error("Update profile error:", e);
        res.status(500).json({ message: "Failed to update profile" });
      }
    },
  );
  // -------- PUBLIC: Browse players --------
  app.get("/api/players", async (_req: Request, res: Response) => {
    try {
      // 1. Get the standard player data
      const list: any[] = await storage.getPublishedPlayers();

      // 2. FORCE FETCH: Get sponsor counts using Raw SQL 
      // This bypasses Drizzle/Schema limitations to ensure we see the new column
      const countsResult = await pool.query("SELECT id, sponsor_count FROM players");
      
      // 3. Create a lookup map: PlayerID -> Count
      const countMap = new Map();
      countsResult.rows.forEach((row: any) => {
        countMap.set(row.id, row.sponsor_count);
      });

      // 4. Merge the data
      const transformed = list
  .filter((p: any) => p.active !== false)
  .map((p: any) => ({
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
    gender: p.gender,
    createdAt: p.createdAt || p.created_at,
    playStyle: p.playStyle || p.play_style,
          // verification info
          atpProfileUrl: p.atpProfileUrl,
          atpVerified: p.atpVerified,
          atpVerificationScore: p.atpVerificationScore,
          
          // 5. Use the Map to get the correct count
          sponsorCount: countMap.get(p.id) || 0, 
        }));

      res.json(transformed);
    } catch (e) {
      console.error("Get players error:", e);
      res.status(500).json({ message: "Failed to get players" });
    }
  });
  // -------- PUBLIC: Get single player --------
  app.get("/api/players/:id", async (req: Request, res: Response) => {
    try {
      const rawId = req.params.id;
      const player: any = await storage.getPlayer(rawId as any);
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
        // expose stripe flags if you want them on detail page too
        stripeAccountId: player.stripeAccountId,
        stripeReady: player.stripeReady,
      };

      res.json(transformed);
    } catch (e) {
      console.error("Get player error:", e);
      res.status(500).json({ message: "Failed to get player" });
    }
  });

  // -------- PUBLIC: Sponsor a player (Checkout) --------
  app.post(
    "/api/players/:id/sponsor-checkout",
    async (req: Request, res: Response) => {
      try {
        const playerIdRaw = req.params.id;
        const body = req.body || {};
        const { amount } = body;

        if (!playerIdRaw) {
          return res.status(400).json({ message: "Invalid player id" });
        }

        const player: any = await storage.getPlayer(playerIdRaw as any);
        if (!player || !player.published || player.active === false) {
          return res.status(404).json({ message: "Player not found" });
        }

        // If Stripe isn't ready for this player, let frontend show interest message
        if (!player.stripeAccountId || !player.stripeReady) {
          return res.status(409).json({
            message: "Player is not yet ready to receive Stripe payouts.",
          });
        }

        const amountCents =
          typeof amount === "number" && amount > 0
            ? Math.round(amount * 100)
            : 5000; // default $50

        const checkoutUrl = await stripeHelpers.createSponsorCheckoutSession({
          playerId: player.id,
          playerName: player.fullName,
          stripeAccountId: player.stripeAccountId,
          amountCents,
          currency: "usd",
        });

        return res.json({ url: checkoutUrl });
      } catch (e: any) {
        console.error("Sponsor checkout (per-player) error:", e);
        return res.status(500).json({
          message: e.message || "Failed to start sponsorship",
        });
      }
    },
  );

  // -------- PLAYER: Upload verification --------
  app.post(
    "/api/verification/upload",
    isAuthenticated,
    uploadVerification.single("file"),
    async (req: any, res: Response) => {
      try {
        const playerId = req.session.playerId;
        const method = req.body.method as "video" | "tournament_doc";

        if (!req.file) {
          return res.status(400).json({ error: "File is required" });
        }
        if (method !== "video" && method !== "tournament_doc") {
          return res.status(400).json({ error: "Invalid method" });
        }

        // Get the player to use their actual ID
        const player: any = await storage.getPlayer(playerId);
        if (!player) {
          return res.status(404).json({ error: "Player not found" });
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
            .where(eq(players.id, player.id)); // Use player.id directly
        } else {
          await db
            .update(players)
            .set({
              verificationMethod: "tournament_doc",
              tournamentDocUrl: relativePath,
              tournamentDocVerified: false,
              verificationStatus: "pending",
            })
            .where(eq(players.id, player.id)); // Use player.id directly
        }

        return res.json({ ok: true, method, fileUrl: relativePath });
      } catch (err) {
        console.error("verification upload error", err);
        return res.status(500).json({ error: "Upload failed" });
      }
    },
  );

  // -------- ADMIN: Get all players --------
  app.get(
    "/api/admin/players",
    isAdmin,
    async (_req: Request, res: Response) => {
      try {
        const playersList = await storage.getAllPlayers();
        res.json(playersList);
      } catch (e) {
        console.error("Admin get players error:", e);
        res.status(500).json({ message: "Failed to get players" });
      }
    },
  );

// EMERGENCY FIX: Add columns if missing AND set default values for existing players
  app.get("/api/admin/emergency-fix", async (_req: Request, res: Response) => {
    try {
      // 1. Ensure columns exist (just in case)
      await pool.query(`
        ALTER TABLE players 
        ADD COLUMN IF NOT EXISTS gender TEXT,
        ADD COLUMN IF NOT EXISTS play_style TEXT
      `);

      // 2. Set default values for anyone who has NULL (Backfill)
      await pool.query(`
        UPDATE players 
        SET gender = 'Male', play_style = 'Singles' 
        WHERE gender IS NULL OR play_style IS NULL
      `);
      
      res.json({ success: true, message: "Fixed: Columns added and defaults set to Male/Singles" });
    } catch (e: any) {
      console.error("Emergency fix error:", e);
      res.status(500).json({ message: e.message });
    }
  });

  // -------- ADMIN: Approve player --------
  app.post(
    "/api/admin/players/:id/approve",
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        const adminId = req.session!.playerId!;
        const playerIdParam = req.params.id;
        
        const player = await storage.approvePlayer(playerIdParam, adminId as any);
        if (!player) {
          return res.status(404).json({ message: "Player not found" });
        }

        // Use player.id from the returned player object
        await db
          .update(players)
          .set({
            verificationStatus: "approved",
            verifiedAt: new Date(),
          })
          .where(eq(players.id, player.id));

        await emailService.notifyPlayerApproved({
          fullName: player.fullName,
          email: player.email,
        });

        res.json(player);
      } catch (e) {
        console.error("Approve player error:", e);
        res.status(500).json({ message: "Failed to approve player" });
      }
    },
  );

  // -------- ADMIN: Manually attach a Stripe account to a player (one-off fix) --------
  app.post(
    "/api/admin/players/:id/set-stripe-account",
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        const playerIdParam = req.params.id; // Keep as string (UUID)
        const { accountId } = req.body || {};

        if (!accountId || typeof accountId !== "string") {
          return res
            .status(400)
            .json({ ok: false, message: "accountId is required" });
        }

        // First get the player to verify they exist and get their ID
        const player: any = await storage.getPlayer(playerIdParam);
        if (!player) {
          return res.status(404).json({
            ok: false,
            message: "Player not found",
            playerId: null,
          });
        }

        // Use player.id directly (already the correct type)
        await db
          .update(players)
          .set({
            stripeAccountId: accountId,
            stripeReady: true, // Mark as ready immediately for test purposes
          })
          .where(eq(players.id, player.id));

        return res.json({
          ok: true,
          playerId: player.id,
          accountId,
          message: "Stripe account attached and marked ready.",
        });
      } catch (err: any) {
        console.error("admin set-stripe-account error:", err);
        return res.status(500).json({
          ok: false,
          message: err?.message || "Unexpected error attaching Stripe account",
        });
      }
    },
  );

  // -------- ADMIN: Reject player --------
  app.post(
    "/api/admin/players/:id/reject",
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        const adminId = req.session!.playerId!;
        const playerIdParam = req.params.id;
        
        const player = await storage.rejectPlayer(playerIdParam, adminId as any);
        if (!player) {
          return res.status(404).json({ message: "Player not found" });
        }

        const reason =
          (req.body && (req.body.reason as string)) || "Not approved";

        // Use player.id from the returned player object
        await db
          .update(players)
          .set({
            verificationStatus: "rejected",
            verificationNotes: reason,
          })
          .where(eq(players.id, player.id));

        await emailService.notifyPlayerRejected({
          fullName: player.fullName,
          email: player.email,
        });

        res.json(player);
      } catch (e) {
        console.error("Reject player error:", e);
        res.status(500).json({ message: "Failed to reject player" });
      }
    },
  );

  // -------- ADMIN: Deactivate player --------
  app.post(
    "/api/admin/players/:id/deactivate",
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        const player = await storage.deactivatePlayer(req.params.id);
        if (!player) {
          return res.status(404).json({ message: "Player not found" });
        }
        res.json(player);
      } catch (e) {
        console.error("Deactivate player error:", e);
        res.status(500).json({ message: "Failed to deactivate player" });
      }
    },
  );

  // -------- ADMIN: Activate player --------
  app.post(
    "/api/admin/players/:id/activate",
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        const player = await storage.activatePlayer(req.params.id);
        if (!player) {
          return res.status(404).json({ message: "Player not found" });
        }
        res.json(player);
      } catch (e) {
        console.error("Activate player error:", e);
        res.status(500).json({ message: "Failed to activate player" });
      }
    },
  );

  // -------- ADMIN: Delete player --------
  app.delete(
    "/api/admin/players/:id",
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        await storage.deletePlayer(req.params.id);
        res.json({ message: "Player deleted" });
      } catch (e) {
        console.error("Delete player error:", e);
        res.status(500).json({ message: "Failed to delete player" });
      }
    },
  );

  // -------- PUBLIC: Sponsor checkout (Stripe) --------
  app.post(
    "/api/payments/sponsor-checkout",
    async (req: Request, res: Response) => {
      try {
        const { playerId, amount } = req.body || {};

        if (!playerId) {
          return res.status(400).json({ message: "playerId is required" });
        }

        const player: any = await storage.getPlayer(playerId);
        if (!player || !player.published || player.active === false) {
          return res.status(404).json({ message: "Player not found" });
        }

        // If they don't have Stripe ready, fall back to "interest only" flow
        if (!player.stripeAccountId || !player.stripeReady) {
          return res.json({ mode: "interest" });
        }

        // amount is optional for now – default to $50 if not provided
        const amountCents =
          typeof amount === "number" && amount > 0
            ? Math.round(amount * 100)
            : 5000; // 5000 cents = $50

        const checkoutUrl = await stripeHelpers.createSponsorCheckoutSession({
          playerId: player.id,
          playerName: player.fullName,
          stripeAccountId: player.stripeAccountId,
          amountCents,
          currency: "usd",
        });

        return res.json({ mode: "checkout", url: checkoutUrl });
      } catch (e: any) {
        console.error("Sponsor checkout error:", e);
        return res.status(500).json({
          message: e.message || "Failed to start sponsorship",
        });
      }
    },
  );

  // -------- PAYMENTS: Stripe Connect onboarding --------
  app.post(
    "/api/payments/stripe/connect-link",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const playerId = req.session!.playerId!;
        const player: any = await storage.getPlayer(playerId);

        if (!player) {
          return res.status(404).json({ message: "Player not found" });
        }

        if (player.approvalStatus !== "approved") {
          return res.status(400).json({
            message: "Profile must be approved before connecting Stripe",
          });
        }

        const account = await stripeHelpers.createOrGetExpressAccount({
          playerId: player.id,
          fullName: player.fullName,
          email: player.email,
          country: player.country,
          existingAccountId: player.stripeAccountId,
        });

        // Save account id if new - use player.id directly (already correct type)
        if (account.id !== player.stripeAccountId) {
          await db
            .update(players)
            .set({ stripeAccountId: account.id })
            .where(eq(players.id, player.id));
        }

        const url = await stripeHelpers.createOnboardingLink(account.id);

        return res.json({ url });
      } catch (e: any) {
        console.error("Stripe connect-link error:", e);
        return res.status(500).json({
          message: e.message || "Failed to create Stripe onboarding link",
        });
      }
    },
  );

  // -------- PAYMENTS: Stripe status (is this player ready for payouts?) --------
  app.get(
    "/api/payments/stripe/status",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const playerId = req.session!.playerId!;
        
        // Use storage.getPlayer instead of db.query.players (which doesn't exist)
        const player: any = await storage.getPlayer(playerId);

        if (!player) {
          return res.status(404).json({ message: "Player not found" });
        }

        // No connected account yet
        if (!player.stripeAccountId) {
          return res.json({
            hasAccount: false,
            ready: false,
            stripeReady: false,
            needsOnboarding: true,
            restricted: false,
            requirementsDue: [],
          });
        }

        // Ask Stripe about this account using the helper
        let status;
        try {
          status = await stripeHelpers.getPayoutStatus(player.stripeAccountId);
        } catch (stripeErr: any) {
          // If the account was deleted in Stripe, reset our DB
          if (stripeErr?.code === "resource_missing") {
            await db
              .update(players)
              .set({
                stripeAccountId: null,
                stripeReady: false,
              })
              .where(eq(players.id, player.id));

            return res.json({
              hasAccount: false,
              ready: false,
              stripeReady: false,
              needsOnboarding: true,
              restricted: false,
              requirementsDue: [],
            });
          }
          throw stripeErr;
        }

        // If Stripe says "ready" but DB flag is false, self-heal DB
        if (status.ready && !player.stripeReady) {
          await db
            .update(players)
            .set({ stripeReady: true })
            .where(eq(players.id, player.id));
        }

        return res.json({
          hasAccount: true,
          ready: status.ready,           // Frontend expects this field
          stripeReady: status.ready,     // Alias for compatibility
          needsOnboarding: !status.ready,
          restricted: status.currentlyDue.length > 0,
          requirementsDue: status.currentlyDue,
        });
      } catch (err: any) {
        console.error("Stripe status error:", err);
        return res.status(500).json({ message: "Failed to fetch Stripe account status" });
      }
    },
  );

  // -------- PAYMENTS: Get player earnings --------
  app.get(
    "/api/payments/stripe/earnings",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const playerId = req.session!.playerId!;
        const player: any = await storage.getPlayer(playerId);

        if (!player) {
          return res.status(404).json({ message: "Player not found" });
        }

        // If no Stripe account, return empty earnings
        if (!player.stripeAccountId) {
          return res.json({
            totalEarnings: 0,
            availableBalance: 0,
            pendingBalance: 0,
            recentTransfers: [],
            currency: "usd",
          });
        }

        // Get earnings from Stripe
        const earnings = await stripeHelpers.getAccountEarnings(player.stripeAccountId);

        return res.json(earnings);
      } catch (err: any) {
        console.error("Get earnings error:", err);
        return res.status(500).json({ message: "Failed to fetch earnings" });
      }
    },
  );

  const httpServer = createServer(app);
// -------- AI: Enhance bio with OpenAI --------
  app.post("/api/ai/enhance-bio", async (req: Request, res: Response) => {
    try {
      const { text, type } = req.body;
      
      if (!text || text.trim().length < 10) {
        return res.status(400).json({ message: "Please provide at least 10 characters to enhance" });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "AI service not configured" });
      }

      const openai = new OpenAI({ apiKey });

      const prompts: Record<string, string> = {
        bio: `You are helping a tennis player write their profile bio for a sponsorship platform. 
Take their rough input and transform it into a compelling, professional bio that:
- Is written in first person
- Highlights their tennis journey and achievements
- Shows their personality and passion
- Is 2-3 paragraphs, around 100-150 words
- Sounds authentic, not overly salesy

Player's input: "${text}"

Return ONLY the enhanced bio text, nothing else.`,
        
        fundingGoals: `You are helping a tennis player describe their funding goals for a sponsorship platform.
Take their rough input and transform it into a clear, compelling funding description that:
- Explains specifically what the funds will be used for
- Shows the impact sponsorship will have on their career
- Is honest and specific about costs
- Is 1-2 paragraphs, around 75-100 words
- Sounds grateful and motivated

Player's input: "${text}"

Return ONLY the enhanced funding goals text, nothing else.`
      };

      const prompt = prompts[type] || prompts.bio;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      });

      const enhanced = completion.choices[0]?.message?.content || "";
      
      res.json({ enhanced });
    } catch (e: any) {
      console.error("AI enhance error:", e);
      res.status(500).json({ message: "Failed to enhance text" });
    }
  });

  // -------- AI: Search/Match Players --------
  app.post("/api/ai/search-players", async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      
      if (!query || query.trim().length < 2) {
        return res.status(400).json({ message: "Please provide a more detailed search query" });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "AI service not configured" });
      }

      // 1. Get all published players
      const players = await storage.getPublishedPlayers();
      
      if (players.length === 0) {
        return res.json({ matchedPlayerIds: [] });
      }

      // 2. FORCE FETCH: Get sponsor counts using Raw SQL (Same fix as Browse page)
      const countsResult = await pool.query("SELECT id, sponsor_count FROM players");
      const countMap = new Map();
      countsResult.rows.forEach((row: any) => {
        countMap.set(row.id, row.sponsor_count);
      });

      // 3. Create a summary of players for AI - Now with ACCURATE sponsor counts
      const playerSummaries = players.map((p: any) => ({
        id: p.id,
        name: p.fullName,
        age: Number(p.age),
        country: p.country,
        location: p.location,
        ranking: p.ranking ? Number(p.ranking) : null,
        specialization: p.specialization,
        bio: p.bio?.substring(0, 200),
        fundingGoals: p.fundingGoals?.substring(0, 150),
        // FIX: Use the map to get the real count from DB
        sponsorCount: countMap.get(p.id) || 0,
      }));

      const openai = new OpenAI({ apiKey });

      const prompt = `You are an expert tennis consultant. A sponsor is searching for players.

CONTEXT ON TENNIS RANKINGS:
- Rank #1 is the BEST. Rank #1000 is lower.
- "Top 100" means ranks 1-100.
- "Rank 800 and up" or "Above 800" is ambiguous. Default to the NUMERIC interpretation (Rank > 800) unless the user implies "better" (e.g. "Top 800").
- "Under 500" means ranks < 500 (Better players).

INSTRUCTIONS:
1. Analyze the Sponsor's Query: "${query}"
2. Filter the players list below.
3. CRITICAL: If the query specifies a number (e.g. "Age 20+", "Rank > 800", "Has > 0 sponsors"), include EVERY player that mathematically fits.
4. If the user asks for "Sponsored players", look for sponsorCount > 0.
5. If the user asks for "Unsponsored" or "Not sponsored", look for sponsorCount == 0.

Available Players:
${JSON.stringify(playerSummaries, null, 2)}

Return ONLY a valid JSON array of strings (IDs). Example: ["id1", "id2"]`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1, 
      });

      const responseText = completion.choices[0]?.message?.content || "[]";
      
      let matchedPlayerIds: string[] = [];
      try {
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          matchedPlayerIds = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", responseText);
        matchedPlayerIds = [];
      }

      const validPlayerIds = players.map((p: any) => p.id);
      matchedPlayerIds = matchedPlayerIds.filter((id: string) => validPlayerIds.includes(id));

      res.json({ matchedPlayerIds });
    } catch (e: any) {
      console.error("AI search error:", e);
      res.status(500).json({ message: "Failed to search players" });
    }
  });
// -------- AI: Ask Analyst (FIXED: Rankings Strategy) --------
  app.post("/api/players/:id/ask-stats", async (req: Request, res: Response) => {
    const playerId = req.params.id;
    const { question } = req.body;

    if (!question) return res.status(400).json({ message: "Question required" });

    try {
      // 1. Get Player Data (DB)
      const player: any = await storage.getPlayer(playerId as any);
      if (!player) return res.status(404).json({ message: "Player not found" });

      const searchName = player.fullName || player.full_name;
      // Default to ATP, but check if gender implies WTA
      const isWTA = player.gender && (player.gender.toLowerCase() === 'female' || player.gender.toLowerCase() === 'wta');
      const rankingEndpoint = isWTA ? 'wta' : 'atp'; 
      
      console.log(`🔍 Analyst looking for: ${searchName} (${rankingEndpoint.toUpperCase()})`);

      // 2. Check Database Cache
      let statsData = null;
      let usedCache = false;
      let cached = null;

      try {
         const [result] = await db
          .select()
          .from(playerStatsCache)
          .where(eq(playerStatsCache.playerId, playerId as any)) 
          .limit(1);
         cached = result;
      } catch (err) {
         console.log("Cache lookup error", err);
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      if (cached && cached.lastUpdated && cached.lastUpdated > sevenDaysAgo && cached.statsJson) {
        console.log(`✅ Using Cached Stats for ${searchName}`);
        statsData = cached.statsJson;
        usedCache = true;
      } else {
        // 3. FETCH FRESH DATA (Rankings Strategy)
        const rapidApiKey = process.env.RAPIDAPI_KEY;
        if (!rapidApiKey) {
           console.warn("Missing RAPIDAPI_KEY");
        } else {
           try {
              let rapidPlayerId = null;

              // STRATEGY A: Fetch Rankings (Reliable)
              // We fetch the top rankings. Valid names WILL be here.
              console.log(`🌍 Strategy A: Fetching ${rankingEndpoint.toUpperCase()} Rankings List...`);
              
              const rankingsUrl = `https://tennis-api-atp-wta-itf.p.rapidapi.com/tennis/v2/${rankingEndpoint}/rankings`;
              const rankingsRes = await fetch(rankingsUrl, {
                  method: 'GET',
                  headers: {
                      'x-rapidapi-key': rapidApiKey,
                      'x-rapidapi-host': 'tennis-api-atp-wta-itf.p.rapidapi.com'
                  }
              });
              await incrementApiUsage(1);
              const rankingsData = await rankingsRes.json();

              if (rankingsData && rankingsData.data) {
                // Fuzzy Match: Does the ranking name include our search name?
                // e.g. "Novak Djokovic" (Rankings) includes "Novak Djokovic" (DB)
                const found = rankingsData.data.find((p: any) => 
                   p.name && p.name.toLowerCase().includes(searchName.toLowerCase()) ||
                   searchName.toLowerCase().includes(p.name?.toLowerCase())
                );

                if (found) {
                   console.log(`✅ Found in Rankings! Name: ${found.name}, ID: ${found.id}`);
                   rapidPlayerId = found.id;
                } else {
                   console.log(`⚠️ Not found in Top Rankings list.`);
                }
              }

              // STRATEGY B: Fallback to Search (Legacy) if Rankings failed
              if (!rapidPlayerId) {
                console.log("⚠️ Rankings failed. Trying V2 Search fallback...");
                const v2Url = `https://tennis-api-atp-wta-itf.p.rapidapi.com/tennis/v2/search?search=${encodeURIComponent(searchName)}`;
                const searchRes = await fetch(v2Url, {
                    method: 'GET',
                    headers: {
                        'x-rapidapi-key': rapidApiKey,
                        'x-rapidapi-host': 'tennis-api-atp-wta-itf.p.rapidapi.com'
                    }
                });
                await incrementApiUsage(1);
                const searchData = await searchRes.json();
                
                rapidPlayerId = searchData?.data?.find((c: any) => c.category === `player_${rankingEndpoint}`)?.result?.[0]?.id 
                                ?? searchData?.data?.flatMap((c: any) => c.result || [])?.[0]?.id;
              }

              // 4. FETCH STATS (If we found an ID)
              if (rapidPlayerId) {
                  console.log(`✅ ID Verified: ${rapidPlayerId}. Fetching Events...`);
                  
                  const statsUrl = `https://tennis-api-atp-wta-itf.p.rapidapi.com/tennis/v2/player/${rapidPlayerId}/events/2025`;
                  const statsRes = await fetch(statsUrl, {
                      method: 'GET',
                      headers: {
                          'x-rapidapi-key': rapidApiKey,
                          'x-rapidapi-host': 'tennis-api-atp-wta-itf.p.rapidapi.com'
                      }
                  });
                  await incrementApiUsage(1);
                  statsData = await statsRes.json();

                  // Save to Cache
                  try {
                      if (cached) {
                          await db.update(playerStatsCache)
                              .set({ statsJson: statsData, lastUpdated: new Date(), tennisApiPlayerId: rapidPlayerId.toString() })
                              .where(eq(playerStatsCache.id, cached.id));
                      } else {
                          await db.insert(playerStatsCache).values({
                              playerId: playerId as any, 
                              tennisApiPlayerId: rapidPlayerId.toString(),
                              statsJson: statsData
                          });
                      }
                  } catch (cacheErr) { console.log("Cache save skipped:", cacheErr); }
              } else {
                 console.log("❌ Player ID not found via Rankings OR Search.");
              }
           } catch (apiErr) {
             console.error("RapidAPI Error:", apiErr);
           }
        }
      }

      // 5. Ask OpenAI
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const contextPrefix = statsData 
        ? `You are an expert tennis analyst. You have access to OFFICIAL 2025 match data for ${searchName}. Data: ${JSON.stringify(statsData)}.`
        : `You are an expert tennis analyst. The user is asking about the tennis player ${searchName}. Even if you don't have their 2025 real-time stats, answer based on their general career and play style.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: contextPrefix },
          { role: "user", content: question }
        ],
      });

      res.json({ 
        answer: completion.choices[0].message.content,
        usedCache,
        lastUpdated: cached?.lastUpdated || new Date()
      });

    } catch (error) {
      console.error("AI Stats Error:", error);
      res.status(500).json({ message: "Failed to analyze stats" });
    }
  });

  return httpServer;
}
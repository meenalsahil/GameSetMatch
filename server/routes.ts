// server/routes.ts
import { stripe, stripeHelpers, isStripeEnabled } from "./stripe.js";
import { and, eq } from "drizzle-orm";
import { emailService } from "./email.js";
import { Express, Request, Response, NextFunction } from "express";
import { createServer, Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import { storage } from "./storage.js";
import { db } from "./db.js";
import {
  players,
  signupPlayerSchema,
  type InsertPlayer,
} from "../shared/schema.js";
import { verifyPlayerAgainstATP } from "./atp-verification.js";


// -------------------- Session helpers --------------------
declare module "express-session" {
  interface SessionData {
    playerId?: number;
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
  // -------- AUTH: Signup with ATP verification --------
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
          // always a string to match schema
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
          atpCurrentRanking:
            atpVerificationResult?.atpData?.currentRanking || null,
        } as const;

        const player = await storage.createPlayer(toCreate as any);

        const atpStatusHtml = atpVerificationResult
          ? `
        <div style="background: white; padding: 20px; margin: 20px 0; border-left: 4px solid ${
          atpVerified ? "#10b981" : "#f59e0b"
        };">
          <h3>ATP Verification Results</h3>
          <p><strong>Status:</strong> ${
            atpVerified ? "✅ AUTO-VERIFIED" : "⚠️ NEEDS REVIEW"
          }</p>
          <p><strong>Score:</strong> ${atpScore}/100</p>
          <ul>
            <li>First Name: ${
              atpVerificationResult.matches.firstName ? "✅" : "❌"
            }</li>
            <li>Last Name: ${
              atpVerificationResult.matches.lastName ? "✅" : "❌"
            }</li>
            <li>Country: ${
              atpVerificationResult.matches.country ? "✅" : "❌"
            }</li>
            <li>Age: ${atpVerificationResult.matches.age ? "✅" : "❌"}</li>
          </ul>
          ${
            atpVerificationResult.discrepancies.length > 0
              ? `
            <p><strong>Issues:</strong></p>
            <ul>${atpVerificationResult.discrepancies
              .map((d: string) => `<li>${d}</li>`)
              .join("")}</ul>
          `
              : ""
          }
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

        req.session!.playerId = player.id;

        res.json({
          player: {
            ...player,
            password_hash: undefined,
            passwordHash: undefined,
          },
        });
      } catch (e) {
        console.error("Signup error:", e);
        res.status(500).json({ message: "Failed to create account" });
      }
    },
  );

  // -------- ADMIN: Reset Stripe for any player (admin only) --------
  app.post(
    "/api/admin/reset-stripe/:playerId",
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        const playerId = Number(req.params.playerId);

        await db
          .update(players)
          .set({
            stripeAccountId: null,
            stripeReady: false,
          })
          .where(eq(players.id, playerId));

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

      // Hard reset the Stripe fields in DB
      await db
        .update(players)
        .set({
          stripeAccountId: null,
          stripeReady: false,
        })
        .where(eq(players.id, Number(playerId)));

      console.log("✅ Player Stripe reset:", { playerId });

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
        };

        const updated = await storage.updatePlayer(String(playerId), update);
        if (!updated) {
          return res.status(404).json({ message: "Player not found" });
        }

        // Return a safe subset (same shape as /api/auth/me)
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
      const list: any[] = await storage.getPublishedPlayers();
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

          // verification info
          atpProfileUrl: p.atpProfileUrl,
          atpVerified: p.atpVerified,
          atpVerificationScore: p.atpVerificationScore,
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
        } else {
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

  // -------- ADMIN: Approve player --------
  app.post(
    "/api/admin/players/:id/approve",
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        const adminId = req.session!.playerId!;
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
      } catch (e) {
        console.error("Approve player error:", e);
        res.status(500).json({ message: "Failed to approve player" });
      }
    },
  );

    // -------- ADMIN: Manually set Stripe account for a player --------
  // -------- ADMIN: Manually attach a Stripe account to a player (one-off fix) --------
app.post(
  "/api/admin/players/:id/set-stripe-account",
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const rawId = req.params.id;
      const { accountId } = req.body || {};

      const playerId = Number(rawId);
      if (!playerId || !Number.isFinite(playerId)) {
        return res
          .status(400)
          .json({ ok: false, message: "Invalid player id", playerId: null });
      }

      if (!accountId || typeof accountId !== "string") {
        return res
          .status(400)
          .json({ ok: false, message: "accountId is required" });
      }

      const updated = await db
        .update(players)
        .set({
          stripeAccountId: accountId,
          stripeReady: false, // will be flipped to true by /stripe/status self-heal
        })
        .where(eq(players.id, playerId))
        .returning({ id: players.id });

      const row = updated[0];

      if (!row) {
        return res.status(404).json({
          ok: false,
          message: "Player not found",
          playerId: null,
        });
      }

      return res.json({
        ok: true,
        playerId: row.id,
        accountId,
        message:
          "Stripe account attached. Next status check will mark it ready if payouts are active.",
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
        const player = await storage.rejectPlayer(req.params.id, adminId);
        if (!player) {
          return res.status(404).json({ message: "Player not found" });
        }

        const reason =
          (req.body && (req.body.reason as string)) || "Not approved";

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

      // IMPORTANT:
      // We do NOT reuse the old stripeAccountId if it was reset or is invalid.
      // Always let Stripe/stripeHelpers create a *new* Express account.
      const account = await stripeHelpers.createOrGetExpressAccount({
        playerId: player.id,
        fullName: player.fullName,
        email: player.email,
        country: player.country,
        // existingAccountId: player.stripeAccountId,  <-- REMOVED
        existingAccountId: undefined,
      });

      // Save (or overwrite) the account id in DB
      if (account.id !== player.stripeAccountId) {
        await db
          .update(players)
          .set({
            stripeAccountId: account.id,
            // don’t mark ready until Stripe says so after onboarding
            stripeReady: false,
          })
.where(eq(players.id, player.id));
      }

      const url = await stripeHelpers.createOnboardingLink(account.id);

      res.json({ url });
    } catch (e: any) {
      console.error("Stripe connect-link error:", e);
      res.status(500).json({
        message: e.message || "Failed to create Stripe onboarding link",
      });
    }
  },
);


  
    // -------- PAYMENTS: Stripe status for current player --------
  app.get(
  "/api/payments/stripe/status",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const playerId = req.session!.playerId!;
      const player: any = await storage.getPlayer(playerId);

      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      // No Stripe account yet → tell frontend to show onboarding button
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

      let status;
      try {
        status = await stripeHelpers.getPayoutStatus(player.stripeAccountId);
      } catch (err: any) {
        const isMissing =
          err?.type === "StripeInvalidRequestError" &&
          err?.code === "resource_missing";

        // Account was deleted at Stripe side → reset DB + act like no account
        if (isMissing) {
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

        console.error("Stripe status error:", err);
        return res
          .status(500)
          .json({ message: "Failed to fetch Stripe account status" });
      }

      const payoutsReady = status.payoutsReady;
      const currentlyDue = status.currentlyDue;

      // Auto-heal DB flag when payouts become ready
      if (payoutsReady && !player.stripeReady) {
        await db
          .update(players)
          .set({ stripeReady: true })
          .where(eq(players.id, player.id));
        player.stripeReady = true;
      }

      return res.json({
        hasAccount: true,
        ready: payoutsReady,
        stripeReady: !!player.stripeReady,
        needsOnboarding: !payoutsReady && currentlyDue.length > 0,
        restricted: currentlyDue.length > 0,
        requirementsDue: currentlyDue,
      });
    } catch (err) {
      console.error("Stripe status outer error:", err);
      return res
        .status(500)
        .json({ message: "Unexpected error getting Stripe status" });
    }
  },
);


const currentlyDue: string[] =
  account.requirements?.currently_due ?? [];

// ✅ SIMPLE RULE: if payouts are enabled, we treat the account as ready
const payoutsReady = !!account.payouts_enabled;


        // Self-heal DB flag if Stripe says it's ready
        if (payoutsReady && !player.stripeReady) {
          await db
            .update(players)
            .set({ stripeReady: true })
            .where(eq(players.id, Number(player.id)));
        }

        return res.json({
          hasAccount: true,
          ready: payoutsReady,          // what frontend expects
          stripeReady: payoutsReady,    // extra alias for safety
          accountId: player.stripeAccountId,
          restricted: currentlyDue.length > 0,
          requirementsDue: currentlyDue,
        });
      } catch (err: any) {
        console.error("Stripe status outer error:", err);
        return res
          .status(500)
          .json({ message: "Unexpected error getting Stripe status" });
      }
    },
  );

  const httpServer = createServer(app);
  return httpServer;
}

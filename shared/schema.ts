import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  text,
  timestamp,
  jsonb,
  date
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  age: integer("age"),
  gender: text("gender"),      
  playStyle: text("play_style"),
  country: text("country"),
  location: text("location"),
  ranking: integer("ranking"),
  specialization: text("specialization"),
  bio: text("bio"),
  fundingGoals: text("funding_goals"),
  photoUrl: text("photo_url"),
  videoUrl: text("video_url"),
  atpProfileUrl: text("atp_profile_url"),

  published: boolean("published").default(false),
  featured: boolean("featured").default(false),
  priority: integer("priority").default(0),
  isAdmin: boolean("is_admin").default(false),
  approvalStatus: text("approval_status").default("pending"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  stripeAccountId: varchar("stripe_account_id", { length: 255 }),
  stripeReady: boolean("stripe_ready").notNull().default(false),

  // Email verification fields
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),

  atpVerified: boolean("atp_verified").default(false),
  atpVerificationScore: integer("atp_verification_score"),
  atpVerificationData: jsonb("atp_verification_data").$type<any>(),
  atpFirstNameMatch: boolean("atp_first_name_match"),
  atpLastNameMatch: boolean("atp_last_name_match"),
  atpCountryMatch: boolean("atp_country_match"),
  atpAgeMatch: boolean("atp_age_match"),
  atpDiscrepancies: text("atp_discrepancies"),
  atpLastChecked: timestamp("atp_last_checked"),
  atpCurrentRanking: integer("atp_current_ranking"),

  verificationMethod: text("verification_method"),
  videoVerified: boolean("video_verified").default(false),
  tournamentDocUrl: text("tournament_doc_url"),
  tournamentDocVerified: boolean("tournament_doc_verified").default(false),
  verificationStatus: text("verification_status").default("pending"),
  verifiedAt: timestamp("verified_at"),
  verificationNotes: text("verification_notes"),
});

// NEW: Table to store your master list (from the PDFs)
export const knownPlayers = pgTable("known_players", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  country: text("country"),
  gender: text("gender"), // 'Male' or 'Female'
  birthDate: date("birth_date"),
  sourceId: text("source_id"), // Optional ID from source
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;
export type KnownPlayer = typeof knownPlayers.$inferSelect;

// ---- Zod schemas used by client + server ----

const isOfficialTourHost = (value: string) => {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const allowedRoots = ["atptour.com", "itftennis.com", "wtatennis.com"];
    return allowedRoots.some(
      (root) => host === root || host.endsWith("." + root),
    );
  } catch {
    return false;
  }
};

export const signupPlayerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Please enter your full name"),
  age: z.number().min(14, "You must be at least 14 years old"),
  gender: z.enum(["male", "female"]).optional(),
  playStyle: z.enum(["singles", "doubles", "both"]).optional(), 
  country: z.string().min(2, "Please enter your country"),
  location: z.string().min(2, "Please enter your location"),
  ranking: z.string().optional(),
  specialization: z.string().min(2, "Please specify your court specialization"),
  bio: z.string().min(10,"Please tell us about your tennis journey (at least 10 characters)"),
  fundingGoals: z.string().min(10,"Please describe what you're raising funds for (at least 10 characters)"),
  videoUrl: z.string().min(1, "Verification video link is required"),
  atpProfileUrl: z.string().trim().min(1, "ATP/ITF/WTA Profile URL is required")
    .refine((value) => {
        if (!value) return true;
        return isOfficialTourHost(value);
      },
      { message: "Please enter a link to an official ATP, ITF, or WTA player profile" },
    ),
  photo: z.any().optional(),
});

export type SignupPlayer = z.infer<typeof signupPlayerSchema>;
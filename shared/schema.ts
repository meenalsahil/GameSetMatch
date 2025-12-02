import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  age: integer("age"),
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

  // ATP AUTO-VERIFICATION
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

  // MANUAL VERIFICATION
  verificationMethod: text("verification_method"),
  videoVerified: boolean("video_verified").default(false),
  tournamentDocUrl: text("tournament_doc_url"),
  tournamentDocVerified: boolean("tournament_doc_verified").default(false),
  verificationStatus: text("verification_status").default("pending"),
  verifiedAt: timestamp("verified_at"),
  verificationNotes: text("verification_notes"),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports
export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

// Signup schema with specific, clear error messages
export const signupPlayerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Please enter your full name"),
  age: z.number().min(13, "You must be at least 13 years old to register"),
  country: z.string().min(2, "Please enter your country"),
  location: z.string().min(2, "Please enter your location (city, state/region)"),
  ranking: z.string().optional(),
  specialization: z.string().min(2, "Please specify your court specialization (e.g., Clay, Hard Court)"),
  bio: z.string().min(10, "Please tell us about your tennis journey (at least 10 characters)"),
  fundingGoals: z.string().min(10, "Please describe what you're raising funds for (at least 10 characters)"),
  
  // Required for verification
  videoUrl: z.string()
    .min(1, "Video link is required for identity verification")
    .url("Please enter a valid video URL (YouTube or Vimeo)"),
  atpProfileUrl: z.string()
    .min(1, "ATP/ITF/WTA Profile URL is required for verification")
    .url("Please enter a valid ATP, ITF, or WTA profile URL"),
  
  photo: z.any().optional(), // File handled by multer
});

export type SignupPlayer = z.infer<typeof signupPlayerSchema>;
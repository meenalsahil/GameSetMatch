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
  videoUrl: text("video_url"), // REUSED for verification video
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

  // ---------------------
  // ATP AUTO-VERIFICATION
  // ---------------------
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

  // ---------------------
  // MANUAL VERIFICATION
  // ---------------------
  verificationMethod: text("verification_method"), // 'video' or 'tournament_doc'

  videoVerified: boolean("video_verified").default(false),

  tournamentDocUrl: text("tournament_doc_url"),
  tournamentDocVerified: boolean("tournament_doc_verified").default(false),

  verificationStatus: text("verification_status").default("pending"),
  verifiedAt: timestamp("verified_at"),
  verificationNotes: text("verification_notes"),
});

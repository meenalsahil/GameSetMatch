import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  age: integer("age").notNull(),
  country: text("country").notNull(),
  location: text("location").notNull(),
  ranking: text("ranking"),
  specialization: text("specialization").notNull(),
  bio: text("bio").notNull(),
  fundingGoals: text("funding_goals").notNull(),
  videoUrl: text("video_url"),
  photoUrl: text("photo_url"),
  published: boolean("published").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  priority: text("priority").default("normal"),
  isAdmin: boolean("is_admin").notNull().default(false),
  approvalStatus: text("approval_status").notNull().default("pending"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  playerId: varchar("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

import { z } from "zod";

export const signupPlayerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1, "Full name is required"),
  age: z
    .number()
    .int()
    .positive()
    .optional()
    .or(z.nan()) // tolerate blank field
    .transform((v) => (isNaN(v) ? undefined : v)),
  country: z.string().min(1, "Country is required"),
  location: z.string().min(1, "Location is required"),
  ranking: z.string().optional().nullable(),
  specialization: z.string().min(1, "Specialization is required"),
  bio: z.string().min(1, "Bio is required"),
  fundingGoals: z.string().min(1, "Funding goals are required"),
  videoUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(""))
    .nullable(),
  atpProfileUrl: z
    .string()
    .url("ATP/ITF Profile URL is required and must be valid")
    .min(1),
});


export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type SignupPlayer = z.infer<typeof signupPlayerSchema>;

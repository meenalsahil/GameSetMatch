import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  priority: text("priority").default('normal'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

export const signupPlayerSchema = insertPlayerSchema.omit({
  passwordHash: true,
  published: true,
  featured: true,
  priority: true,
  photoUrl: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  age: z.number().int().positive().min(13, "You must be at least 13 years old"),
  country: z.string().min(1, "Country is required"),
  fundingGoals: z.string().min(10, "Please describe your funding goals (at least 10 characters)"),
  videoUrl: z.union([z.string().url("Please enter a valid URL"), z.literal("")]).optional(),
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type SignupPlayer = z.infer<typeof signupPlayerSchema>;

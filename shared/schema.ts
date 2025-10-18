import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  location: text("location").notNull(),
  ranking: text("ranking"),
  specialization: text("specialization").notNull(),
  bio: text("bio").notNull(),
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
  published: true,
  featured: true,
  priority: true,
  photoUrl: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type SignupPlayer = z.infer<typeof signupPlayerSchema>;

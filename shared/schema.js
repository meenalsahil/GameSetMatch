import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export const players = pgTable("players", {
    id: varchar("id")
        .primaryKey()
        .default(sql `gen_random_uuid()`),
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
        .default(sql `gen_random_uuid()`),
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
export const signupPlayerSchema = insertPlayerSchema
    .omit({
    passwordHash: true,
    published: true,
    featured: true,
    priority: true,
    photoUrl: true,
    isAdmin: true,
    approvalStatus: true,
    approvedBy: true,
    approvedAt: true,
})
    .extend({
    email: z.string().email("A valid email is required"), // ✅ Add this back explicitly
    password: z.string().min(8, "Password must be at least 8 characters"), // ✅ Add password field for signup
    fullName: z.string().min(2, "Full name is required"), // ✅ Ensure name is required
    age: z.number().int().positive().min(13, "You must be at least 13 years old"),
    country: z.string().min(1, "Country is required"),
    fundingGoals: z
        .string()
        .min(10, "Please describe your funding goals (at least 10 characters)"),
    location: z.string().optional(),
    ranking: z.string().optional(),
    specialization: z.string().optional(),
    bio: z.string().optional(),
    videoUrl: z
        .union([z.string().url("Please enter a valid URL"), z.literal("")])
        .optional(),
    atpProfileUrl: z.string().url().optional(),
    photo: z.any().optional(), // file uploads
});

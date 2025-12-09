import { pgTable, foreignKey, unique, varchar, text, timestamp, integer, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	playerId: varchar("player_id").notNull(),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.playerId],
			foreignColumns: [players.id],
			name: "password_reset_tokens_player_id_players_id_fk"
		}).onDelete("cascade"),
	unique("password_reset_tokens_token_unique").on(table.token),
]);

export const players = pgTable("players", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	fullName: text("full_name").notNull(),
	age: integer().notNull(),
	country: text().notNull(),
	location: text().notNull(),
	ranking: text(),
	specialization: text().notNull(),
	bio: text().notNull(),
	fundingGoals: text("funding_goals").notNull(),
	videoUrl: text("video_url"),
	photoUrl: text("photo_url"),
	published: boolean().default(false).notNull(),
	featured: boolean().default(false).notNull(),
	active: boolean().default(true).notNull(),
	priority: text().default('normal'),
	isAdmin: boolean("is_admin").default(false).notNull(),
	approvalStatus: text("approval_status").default('pending').notNull(),
	approvedBy: varchar("approved_by"),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	atpProfileUrl: text("atp_profile_url").notNull(),
}, (table) => [
	unique("players_email_unique").on(table.email),
]);

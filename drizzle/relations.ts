import { relations } from "drizzle-orm/relations";
import { players, passwordResetTokens } from "./schema";

export const passwordResetTokensRelations = relations(passwordResetTokens, ({one}) => ({
	player: one(players, {
		fields: [passwordResetTokens.playerId],
		references: [players.id]
	}),
}));

export const playersRelations = relations(players, ({many}) => ({
	passwordResetTokens: many(passwordResetTokens),
}));
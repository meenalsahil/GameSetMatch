import { type Player, type InsertPlayer, players, passwordResetTokens } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayerByEmail(email: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  getAllPlayers(): Promise<Player[]>;
  getPublishedPlayers(): Promise<Player[]>;
  getFeaturedPlayers(): Promise<Player[]>;
  updatePlayer(id: string, player: Partial<InsertPlayer>): Promise<Player | undefined>;
  publishPlayer(id: string): Promise<Player | undefined>;
  approvePlayer(id: string, adminId: string): Promise<Player | undefined>;
  rejectPlayer(id: string, adminId: string): Promise<Player | undefined>;
  deletePlayer(id: string): Promise<void>;
  createPasswordResetToken(playerId: string, token: string, expiresAt: Date): Promise<void>;
  getPasswordResetToken(token: string): Promise<{ id: string; playerId: string; expiresAt: Date } | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
}

export class DbStorage implements IStorage {
  async getPlayer(id: string): Promise<Player | undefined> {
    const result = await db.select().from(players).where(eq(players.id, id)).limit(1);
    return result[0];
  }

  async getPlayerByEmail(email: string): Promise<Player | undefined> {
    const result = await db.select().from(players).where(eq(players.email, email)).limit(1);
    return result[0];
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const result = await db.insert(players).values(player).returning();
    return result[0];
  }

  async getAllPlayers(): Promise<Player[]> {
    return db.select().from(players);
  }

  async getPublishedPlayers(): Promise<Player[]> {
    return db.select().from(players).where(eq(players.published, true));
  }

  async getFeaturedPlayers(): Promise<Player[]> {
    return db.select().from(players).where(eq(players.featured, true)).limit(4);
  }

  async updatePlayer(id: string, player: Partial<InsertPlayer>): Promise<Player | undefined> {
    const result = await db.update(players).set(player).where(eq(players.id, id)).returning();
    return result[0];
  }

  async publishPlayer(id: string): Promise<Player | undefined> {
    const result = await db.update(players).set({ published: true }).where(eq(players.id, id)).returning();
    return result[0];
  }

  async approvePlayer(id: string, adminId: string): Promise<Player | undefined> {
    const result = await db.update(players)
      .set({ 
        approvalStatus: 'approved',
        approvedBy: adminId,
        approvedAt: new Date()
      })
      .where(eq(players.id, id))
      .returning();
    return result[0];
  }

  async rejectPlayer(id: string, adminId: string): Promise<Player | undefined> {
    const result = await db.update(players)
      .set({ 
        approvalStatus: 'rejected',
        approvedBy: adminId,
        approvedAt: new Date()
      })
      .where(eq(players.id, id))
      .returning();
    return result[0];
  }

  async deletePlayer(id: string): Promise<void> {
    await db.delete(players).where(eq(players.id, id));
  }

  async createPasswordResetToken(playerId: string, token: string, expiresAt: Date): Promise<void> {
    await db.insert(passwordResetTokens).values({
      playerId,
      token,
      expiresAt,
    });
  }

  async getPasswordResetToken(token: string): Promise<{ id: string; playerId: string; expiresAt: Date } | undefined> {
    const result = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token)).limit(1);
    return result[0];
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }
}

export const storage = new DbStorage();

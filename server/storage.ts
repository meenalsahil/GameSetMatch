import { type Player, type InsertPlayer, players } from "@shared/schema";
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
}

export const storage = new DbStorage();

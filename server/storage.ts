// server/storage.ts
import {
  type Player,
  type InsertPlayer,
  players,
  passwordResetTokens,
} from "../shared/schema.js";
import { pool, db } from "./db.js";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayerByEmail(email: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  getAllPlayers(): Promise<Player[]>;
  getPublishedPlayers(): Promise<Player[]>;
  getFeaturedPlayers(): Promise<Player[]>;
  updatePlayer(
    id: string,
    player: Partial<InsertPlayer>,
  ): Promise<Player | undefined>;
  publishPlayer(id: string): Promise<Player | undefined>;
  approvePlayer(id: string, adminId: number): Promise<Player | undefined>;
  rejectPlayer(id: string, adminId: number): Promise<Player | undefined>;
  deactivatePlayer(id: string): Promise<Player | undefined>;
  activatePlayer(id: string): Promise<Player | undefined>;
  deletePlayer(id: string): Promise<void>;
  createPasswordResetToken(
    playerId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  getPasswordResetToken(
    token: string,
  ): Promise<{ id: string; playerId: string; expiresAt: Date } | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
}

export class DbStorage implements IStorage {
  async getPlayer(id: string | number) {
    const numericId =
      typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
    const rows = await db
      .select()
      .from(players)
      .where(eq(players.id, numericId as any))
      .limit(1);
    // rows[0] has all columns, including stripeAccountId & stripeReady
    return rows[0] ?? null;
  }

  async getPlayerByEmail(email: string): Promise<Player | undefined> {
    try {
      const result = await db
        .select()
        .from(players)
        .where(eq(players.email, email))
        .limit(1);

      if (result && result.length > 0) {
        console.log("storage.getPlayerByEmail - Player found");
        return result[0];
      }

      console.log("storage.getPlayerByEmail - Player not found");
      return undefined;
    } catch (error) {
      console.error("storage.getPlayerByEmail - Error:", error);
      return undefined;
    }
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const result = await pool.query(
      `INSERT INTO players (
        email, password_hash, full_name, age, country, location,
        ranking, specialization, bio, funding_goals, video_url,
        atp_profile_url, photo_url, published, featured, priority,
        approval_status, active,
        atp_verified, atp_verification_score, atp_verification_data,
        atp_first_name_match, atp_last_name_match, atp_country_match, atp_age_match,
        atp_discrepancies, atp_last_checked, atp_current_ranking
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
      RETURNING *`,
      [
        player.email,
        player.passwordHash,
        player.fullName,
        player.age,
        player.country,
        player.location,
        player.ranking,
        player.specialization,
        player.bio,
        player.fundingGoals,
        player.videoUrl,
        player.atpProfileUrl || null,
        player.photoUrl || null,
        false, // published
        false, // featured
        player.priority || 0,
        "pending", // approval_status
        true, // active
        player.atpVerified || false,
        player.atpVerificationScore || null,
        player.atpVerificationData || null,
        player.atpFirstNameMatch || false,
        player.atpLastNameMatch || false,
        player.atpCountryMatch || false,
        player.atpAgeMatch || false,
        player.atpDiscrepancies || null,
        player.atpLastChecked || null,
        player.atpCurrentRanking || null,
      ],
    );

    return result.rows[0];
  }

  async getAllPlayers(): Promise<Player[]> {
    const result = await db
      .select()
      .from(players)
      .orderBy(desc(players.createdAt));
    return result;
  }

  async getPublishedPlayers(): Promise<Player[]> {
    const result = await db
      .select()
      .from(players)
      .where(eq(players.published, true));
    return result;
  }

  async getFeaturedPlayers(): Promise<Player[]> {
    const result = await db
      .select()
      .from(players)
      .where(eq(players.featured, true))
      .orderBy(desc(players.createdAt))
      .limit(4);
    return result;
  }

  async updatePlayer(
    id: string,
    player: Partial<InsertPlayer>,
  ): Promise<Player | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (player.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(player.email);
    }
    if (player.fullName !== undefined) {
      fields.push(`full_name = $${paramCount++}`);
      values.push(player.fullName);
    }
    if (player.age !== undefined) {
      fields.push(`age = $${paramCount++}`);
      values.push(player.age);
    }
    if (player.country !== undefined) {
      fields.push(`country = $${paramCount++}`);
      values.push(player.country);
    }
    if (player.location !== undefined) {
      fields.push(`location = $${paramCount++}`);
      values.push(player.location);
    }
    if (player.ranking !== undefined) {
      fields.push(`ranking = $${paramCount++}`);
      values.push(player.ranking);
    }
    if (player.specialization !== undefined) {
      fields.push(`specialization = $${paramCount++}`);
      values.push(player.specialization);
    }
    if (player.bio !== undefined) {
      fields.push(`bio = $${paramCount++}`);
      values.push(player.bio);
    }
    if (player.fundingGoals !== undefined) {
      fields.push(`funding_goals = $${paramCount++}`);
      values.push(player.fundingGoals);
    }
    if (player.videoUrl !== undefined) {
      fields.push(`video_url = $${paramCount++}`);
      values.push(player.videoUrl);
    }
    if (player.atpProfileUrl !== undefined) {
      fields.push(`atp_profile_url = $${paramCount++}`);
      values.push(player.atpProfileUrl);
    }
    if (player.photoUrl !== undefined) {
      fields.push(`photo_url = $${paramCount++}`);
      values.push(player.photoUrl);
    }

    if (fields.length === 0) {
      return this.getPlayer(Number(id));
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE players SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async publishPlayer(id: string): Promise<Player | undefined> {
    const result = await pool.query(
      "UPDATE players SET published = true WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  }

  async approvePlayer(
    id: string,
    adminId: number,
  ): Promise<Player | undefined> {
    const result = await pool.query(
      "UPDATE players SET approval_status = 'approved', published = true, approved_by = $2, approved_at = NOW() WHERE id = $1 RETURNING *",
      [id, adminId],
    );
    return result.rows[0];
  }

  async rejectPlayer(id: string, adminId: number): Promise<Player | undefined> {
    const result = await pool.query(
      "UPDATE players SET approval_status = 'rejected', approved_by = $2, approved_at = NOW() WHERE id = $1 RETURNING *",
      [id, adminId],
    );
    return result.rows[0];
  }

  async deactivatePlayer(id: string): Promise<Player | undefined> {
    const result = await pool.query(
      `UPDATE players SET active = false WHERE id = $1 RETURNING *`,
      [id],
    );
    return result.rows[0];
  }

  async activatePlayer(id: string): Promise<Player | undefined> {
    const result = await pool.query(
      `UPDATE players SET active = true WHERE id = $1 RETURNING *`,
      [id],
    );
    return result.rows[0];
  }

  async deletePlayer(id: string): Promise<void> {
    await pool.query(`DELETE FROM players WHERE id = $1`, [id]);
  }

  async createPasswordResetToken(
    playerId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await pool.query(
      "INSERT INTO password_reset_tokens (player_id, token, expires_at) VALUES ($1, $2, $3)",
      [playerId, token, expiresAt],
    );
  }

  async getPasswordResetToken(
    token: string,
  ): Promise<{ id: string; playerId: string; expiresAt: Date } | undefined> {
    const result = await pool.query(
      "SELECT * FROM password_reset_tokens WHERE token = $1",
      [token],
    );
    return result.rows[0];
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await pool.query("DELETE FROM password_reset_tokens WHERE token = $1", [
      token,
    ]);
  }
}

export const storage = new DbStorage();
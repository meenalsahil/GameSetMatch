import { players, } from "../shared/schema.js";
import { pool, db } from "./db.js";
import { eq, desc } from "drizzle-orm";
export class DbStorage {
    async getPlayer(id) {
        const numericId = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
        const rows = await db
            .select()
            .from(players)
            .where(eq(players.id, numericId))
            .limit(1);
        return rows[0] ?? null;
    }
    async getPlayerByEmail(email) {
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
        }
        catch (error) {
            console.error("storage.getPlayerByEmail - Error:", error);
            return undefined;
        }
    }
    async createPlayer(player) {
        const result = await pool.query(`INSERT INTO players (
        email, password_hash, full_name, age, country, location,
        ranking, specialization, bio, funding_goals, video_url,
        atp_profile_url, photo_url, published, featured, priority,
        approval_status, active,
        atp_verified, atp_verification_score, atp_verification_data,
        atp_first_name_match, atp_last_name_match, atp_country_match, atp_age_match,
        atp_discrepancies, atp_last_checked, atp_current_ranking
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
      RETURNING *`, [
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
        ]);
        return result.rows[0];
    }
    async getAllPlayers() {
        const result = await db
            .select()
            .from(players)
            .orderBy(desc(players.createdAt));
        return result;
    }
    async getPublishedPlayers() {
        const result = await db
            .select()
            .from(players)
            .where(eq(players.published, true));
        return result;
    }
    async getFeaturedPlayers() {
        const result = await db
            .select()
            .from(players)
            .where(eq(players.featured, true))
            .orderBy(desc(players.createdAt))
            .limit(4);
        return result;
    }
    async updatePlayer(id, player) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (player.email !== undefined) {
            fields.push(`email = $${paramCount++}`);
            values.push(player.email);
        }
        if (player.fullName !== undefined) {
            fields.push(`full_name = $${paramCount++}`);
            values.push(player.fullName);
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
        if (player.photoUrl !== undefined) {
            fields.push(`photo_url = $${paramCount++}`);
            values.push(player.photoUrl);
        }
        if (fields.length === 0) {
            return this.getPlayer(Number(id));
        }
        values.push(id);
        const result = await pool.query(`UPDATE players SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`, values);
        return result.rows[0];
    }
    async publishPlayer(id) {
        const result = await pool.query("UPDATE players SET published = true WHERE id = $1 RETURNING *", [id]);
        return result.rows[0];
    }
    async approvePlayer(id, adminId) {
        const result = await pool.query("UPDATE players SET approval_status = 'approved', published = true, approved_by = $2, approved_at = NOW() WHERE id = $1 RETURNING *", [id, adminId]);
        return result.rows[0];
    }
    async rejectPlayer(id, adminId) {
        const result = await pool.query("UPDATE players SET approval_status = 'rejected', approved_by = $2, approved_at = NOW() WHERE id = $1 RETURNING *", [id, adminId]);
        return result.rows[0];
    }
    async deactivatePlayer(id) {
        const result = await pool.query(`UPDATE players SET active = false WHERE id = $1 RETURNING *`, [id]);
        return result.rows[0];
    }
    async activatePlayer(id) {
        const result = await pool.query(`UPDATE players SET active = true WHERE id = $1 RETURNING *`, [id]);
        return result.rows[0];
    }
    async deletePlayer(id) {
        await pool.query(`DELETE FROM players WHERE id = $1`, [id]);
    }
    async createPasswordResetToken(playerId, token, expiresAt) {
        await pool.query("INSERT INTO password_reset_tokens (player_id, token, expires_at) VALUES ($1, $2, $3)", [playerId, token, expiresAt]);
    }
    async getPasswordResetToken(token) {
        const result = await pool.query("SELECT * FROM password_reset_tokens WHERE token = $1", [token]);
        return result.rows[0];
    }
    async deletePasswordResetToken(token) {
        await pool.query("DELETE FROM password_reset_tokens WHERE token = $1", [
            token,
        ]);
    }
}
export const storage = new DbStorage();

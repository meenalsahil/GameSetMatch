import 'dotenv/config';
import { db, pool } from './db.js';
import { players } from '../shared/schema.js';
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';
async function seed() {
    try {
        console.log("🌱 Seeding database...\n");
        // ---------------------------
        // Create Admin Account
        // ---------------------------
        const adminEmail = "sudhirmalin@gmail.com";
        const existingAdmin = await db.select().from(players).where(eq(players.email, adminEmail));
        if (existingAdmin.length > 0) {
            await db.delete(players).where(eq(players.email, adminEmail));
        }
        const adminHash = await bcrypt.hash("admin123", 10);
        await db.insert(players).values({
            email: adminEmail,
            passwordHash: adminHash,
            fullName: "Sudhir Malin",
            age: 30,
            country: "India",
            location: "India",
            ranking: "N/A",
            specialization: "Platform Admin",
            bio: "Platform Administrator",
            fundingGoals: "N/A",
            isAdmin: true,
            approvalStatus: "approved",
            published: false,
            atpProfileUrl: null,
            videoUrl: null,
            photoUrl: null,
        });
        console.log("✓ Admin account created");
        // ---------------------------
        // Create Sample Players
        // ---------------------------
        const samplePlayers = [
            {
                email: "player1@example.com",
                fullName: "Alex Rodriguez",
                age: 22,
                country: "Spain",
                location: "Barcelona, Spain",
                ranking: "ATP 250",
                specialization: "Singles - Clay Court",
                bio: "Professional tennis player specializing in clay court tournaments.",
                fundingGoals: "Travel and accommodation for European tour",
            },
            {
                email: "player2@example.com",
                fullName: "Maria Santos",
                age: 20,
                country: "Brazil",
                location: "Rio de Janeiro, Brazil",
                ranking: "ITF 500",
                specialization: "Singles - Hard Court",
                bio: "Rising star in South American tennis circuit.",
                fundingGoals: "Training equipment and tournament fees",
            },
            {
                email: "player3@example.com",
                fullName: "James Chen",
                age: 24,
                country: "USA",
                location: "Los Angeles, USA",
                ranking: "Challenger 150",
                specialization: "Doubles",
                bio: "Experienced doubles player in North American circuit.",
                fundingGoals: "Travel costs and coaching fees",
            },
            {
                email: "player4@example.com",
                fullName: "Sophie Martin",
                age: 19,
                country: "France",
                location: "Paris, France",
                ranking: "ITF 300",
                specialization: "Singles - Grass Court",
                bio: "Young talent focusing on grass court tournaments.",
                fundingGoals: "Tennis equipment and tournament travel",
            },
        ];
        for (const player of samplePlayers) {
            const existing = await db.select().from(players).where(eq(players.email, player.email));
            if (existing.length > 0) {
                await db.delete(players).where(eq(players.email, player.email));
            }
            const hash = await bcrypt.hash("player123", 10);
            await db.insert(players).values({
                ...player,
                passwordHash: hash,
                published: true,
                featured: true,
                approvalStatus: "approved",
                isAdmin: false,
                atpProfileUrl: null,
                videoUrl: null,
                photoUrl: null,
            });
        }
        console.log("✓ Sample players created\n");
        // ---------------------------
        // Create Session Table
        // ---------------------------
        console.log("📝 Creating session table...");
        await db.execute(sql `
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `);
        await db.execute(sql `
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")
    `);
        console.log("✅ Session table created\n");
        console.log("==========================================");
        console.log("Sign in with:");
        console.log("  Email: sudhirmalin@gmail.com");
        console.log("  Password: admin123");
        console.log("==========================================");
    }
    catch (error) {
        console.error("❌ Seed error:", error);
    }
    finally {
        // ✅ Always close connection pool
        await pool.end();
        console.log("✅ Database connection closed.");
        process.exit(0);
    }
}
seed();

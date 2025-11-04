import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from "dotenv";

// ✅ Load .env only in local development (not in production)
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// ✅ Read DATABASE_URL directly from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is missing!");
  throw new Error("DATABASE_URL not found");
}

console.log("✅ Connecting to:", connectionString);

// ✅ Create connection pool
export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // required for Railway
  },
});

export const db = drizzle(pool);

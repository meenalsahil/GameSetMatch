import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

// Load .env only for local development
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is missing!");
  throw new Error("DATABASE_URL not found");
}

console.log("✅ Connecting to database:", connectionString);

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool);

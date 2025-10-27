import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

// ✅ Force internal host if missing and enforce SSL
if (!connectionString.includes(".internal")) {
  connectionString = connectionString.replace(
    /(@[^/]+)\//,
    (match) => `${match.split("@")[0]}@dpg-d3vsmgje5dus73abcou0-a.internal/`
  );
}

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool);

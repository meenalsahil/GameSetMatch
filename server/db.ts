import dotenv from "dotenv";
import path from "path";

// Explicitly point to the .env file inside /server
dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

// Load environment variables from .env file
dotenv.config();
console.log("Loaded .env from:", process.cwd());
console.log("DATABASE_URL =", process.env.DATABASE_URL);


// Get the DATABASE_URL from .env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is missing!");
  throw new Error("DATABASE_URL is not set in environment variables");
}

console.log("✅ Connecting to database:", connectionString);

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Needed for Railway Postgres
  },
});

export const db = drizzle(pool);

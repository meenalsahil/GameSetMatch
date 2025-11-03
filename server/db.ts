import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

// ✅ Make sure DATABASE_URL is read from root .env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ DATABASE_URL is missing from .env file");
}

// ✅ Initialize a single Postgres connection pool
export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Required for Railway Postgres
});

// ✅ Create and export Drizzle instance
export const db = drizzle(pool);

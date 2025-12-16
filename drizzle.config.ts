import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load the .env file manually to ensure DATABASE_URL is found
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in your .env file");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
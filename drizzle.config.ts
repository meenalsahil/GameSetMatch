import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts", // ✅ correct relative path
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: true, // ✅ required for Render PostgreSQL
  },
});

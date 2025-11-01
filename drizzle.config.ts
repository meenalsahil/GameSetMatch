import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // ✅ required for Drizzle v0.30+
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

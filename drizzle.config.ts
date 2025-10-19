import { configDotenv } from "dotenv";
import { defineConfig } from "drizzle-kit";

configDotenv({
  path: [".env", ".env.local"],
});

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    table: "moodi_migrations",
    schema: "public",
  },
});

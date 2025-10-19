import { drizzle } from "drizzle-orm/neon-http";
import { configDotenv } from "dotenv";

configDotenv({
  path: [".env", ".env.local"],
});

const db = drizzle(process.env.DATABASE_URL!);

export { db };

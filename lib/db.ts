import { Pool } from "pg";
import "dotenv/config";

const globalForDb = globalThis as unknown as { pool?: Pool };

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

export const db =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = db;
}

db.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

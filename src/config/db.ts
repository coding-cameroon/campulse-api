import postgres from "postgres";
import { DATABASE_URL } from "./env";
import * as schema from "@/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";

const client = postgres(DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

export async function connectDB() {
  try {
    await client`SELECT 1`;
    console.log("PostgreSQL connected successfully");
  } catch (err) {
    console.log("DB connection failed", { error: err });
    process.exit(1);
  }
}

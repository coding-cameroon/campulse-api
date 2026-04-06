import { config } from "dotenv";

const dotenv = config({ override: true, quiet: true });

export const {
  PORT,
  NODE_ENV,
  ADMIN_EMAIL,
  DATABASE_URL,
  CLERK_SECRET_KEY,
  CLERK_PUBLISHABLE_KEY,
  CLERK_WEBHOOK_SIGNING_SECRET,
} = process.env;

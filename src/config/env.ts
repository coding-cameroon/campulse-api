import { config } from "dotenv";

const dotenv = config({ override: true, quiet: true });

export const {
  PORT,
  NODE_ENV,
  CLIENT_URL,
  ADMIN_EMAIL,
  ENABLE_CRON,
  DATABASE_URL,
  CLERK_SECRET_KEY,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT,
  CLERK_PUBLISHABLE_KEY,
  CLERK_WEBHOOK_SIGNING_SECRET,
} = process.env;

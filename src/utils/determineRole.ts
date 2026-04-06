import { ADMIN_EMAIL } from "@/config/env.js";

export const determineRole = (email: string): "admin" | "student" => {
  return ADMIN_EMAIL === email ? "admin" : "student";
};

import { pgTable, pgEnum, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["student", "admin"]);

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),

  firstName: text("first_name"),
  lastName: text("last_name"),
  realAvatarUrl: text("real_avatar_url"),

  anonymousName: text("anonymous_name").notNull(),
  anonymousAvatarUrl: text("anonymous_avatar_url").notNull(),

  role: roleEnum("role").default("student").notNull(),
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

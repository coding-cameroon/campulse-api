import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { posts } from "./posts";

export const reactionTypeEnum = pgEnum("reaction_type", [
  "like",
  "heart",
  "laugh",
  "sad",
]);

export const reactions = pgTable(
  "reactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    type: reactionTypeEnum("type").default("like").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueReaction: unique("unique_reaction").on(table.postId, table.userId),
    postIdx: index("reactions_post_idx").on(table.postId),
    userIdx: index("reactions_user_idx").on(table.userId),
  }),
);

export type Reaction = typeof reactions.$inferSelect;
export type NewReaction = typeof reactions.$inferInsert;

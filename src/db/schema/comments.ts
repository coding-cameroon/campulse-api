import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { posts } from "./posts";

export const comments = pgTable(
  "comments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),

    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    displayAvatarUrl: text("display_avatar_url").notNull(),

    body: text("body").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    postIdx: index("comments_post_idx").on(table.postId),
    authorIdx: index("comments_author_idx").on(table.authorId),
  }),
);

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

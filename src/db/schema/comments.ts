import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { posts } from "./posts";
import { relations } from "drizzle-orm";

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

    body: text("body").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    postIdx: index("comments_post_idx").on(table.postId),
    authorIdx: index("comments_author_idx").on(table.authorId),
  }),
);

export const commentRelationship = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

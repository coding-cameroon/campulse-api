import {
  pgTable,
  pgEnum,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { IntegrationInSerializer } from "svix/dist/models/integrationIn.js";

export const postCategoryEnum = pgEnum("post_category", [
  "feed",
  "event",
  "lost_found",
]);

export const postStatusEnum = pgEnum("post_status", [
  "active",
  "expired",
  "removed",
]);

export const itemStatusEnum = pgEnum("item_status", ["lost", "found"]);

export const posts = pgTable(
  "posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    category: postCategoryEnum("category").notNull(),
    status: postStatusEnum("status").default("active").notNull(),

    title: text("title"),
    body: text("body").notNull(),
    imageUrls: text("image_urls").array(),
    imageFileIds: text("image_file_ids").array(),

    // anyn feeds
    anonName: text("anon_name"),
    anonAvatarUrl: text("anon_avatar_url"),

    // events and lost found
    realName: text("real_name"),
    realAvatarUrl: text("real_avatar_url"),

    // lost found
    collectAt: text("collect_at"),
    lastSeenAt: text("last_seen_at"),
    phoneNumber: integer("phone_number"),
    itemStatus: itemStatusEnum("item_status"),

    // events
    eventLocation: text("event_location"),
    eventStartAt: timestamp("event_start_at"),
    eventEndAt: timestamp("event_end_at"),
    mapCoordinates: jsonb("map_coordinates").$type<{
      lat: number;
      lng: number;
    }>(),

    expiresAt: timestamp("expires_at"),

    reactionCount: integer("reaction_count").default(0).notNull(),
    commentCount: integer("comment_count").default(0).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("posts_category_idx").on(table.category),
    statusIdx: index("posts_status_idx").on(table.status),
    expiresAtIdx: index("posts_expires_at_idx").on(table.expiresAt),
    authorIdx: index("posts_author_idx").on(table.authorId),
  }),
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

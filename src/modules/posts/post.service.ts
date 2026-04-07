import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/config/db.js";
import { NewPost, Post, posts } from "@/db/schema/posts.js";

type GetPostsOptions = {
  page: number;
  limit: number;
  category?: Post["category"];
};

export const postServices = {
  // CREATE POST
  async createPost(data: NewPost): Promise<Post> {
    return await db.transaction(async (tx) => {
      const [post] = await tx.insert(posts).values(data).returning();

      return post;
    });
  },

  // GET POSTS
  async getPosts({ page, limit, category }: GetPostsOptions): Promise<Post[]> {
    const offset = (page - 1) * limit;

    return await db
      .select()
      .from(posts)
      .where(
        and(
          gt(posts.expiresAt, new Date()),
          eq(posts.status, "active"),
          category ? eq(posts.category, category) : undefined,
        ),
      )
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  },

  // GET POST
  async getPost(id: string): Promise<Post> {
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);
    return post;
  },

  // DELETE POST
  async deletePost(id: string): Promise<NewPost> {
    return await db.transaction(async (tx) => {
      const [deletedPost] = await tx
        .delete(posts)
        .where(eq(posts.id, id))
        .returning();

      return deletedPost;
    });
  },
};

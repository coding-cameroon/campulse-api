import { desc, eq } from "drizzle-orm";
import { db } from "@/config/db.js";
import { Comment, comments, NewComment } from "@/db/schema/comments.js";

export const commentServices = {
  // create comments
  async createComment(data: NewComment): Promise<Comment> {
    return await db.transaction(async (tx) => {
      const [comment] = await tx.insert(comments).values(data).returning();
      return comment;
    });
  },

  // delete comments
  async deleteComment(id: string): Promise<Comment> {
    return await db.transaction(async (tx) => {
      const [comment] = await tx
        .delete(comments)
        .where(eq(comments.id, id))
        .returning();
      return comment;
    });
  },

  // get comment of postId
  async getComments(id: string, page = 1, limit = 20): Promise<Comment[]> {
    const offset = (page - 1) * limit;

    return await db.query.comments.findMany({
      where: eq(comments.postId, id),
      with: { author: true },
      limit,
      offset,
      orderBy: desc(comments.createdAt),
    });
  },

  // get comment
  async getComment(id: string): Promise<Comment | undefined> {
    return await db.query.comments.findFirst({
      where: eq(comments.id, id),
      with: {
        author: true,
      },
    });
  },
};

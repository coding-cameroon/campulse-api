import { eq } from "drizzle-orm";
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

    return await db
      .select()
      .from(comments)
      .where(eq(comments.postId, id))
      .limit(limit)
      .offset(offset);
  },

  // get comment
  async getComment(id: string): Promise<Comment> {
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1);
    return comment;
  },
};

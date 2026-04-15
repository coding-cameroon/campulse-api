import { db } from "@/config/db.js";
import { NewReaction, Reaction, reactions } from "@/db/schema/reactions.js";
import { and, eq } from "drizzle-orm";

type reactionProps = { userId: string; postId: string };

export const reactionServices = {
  // CREATE REACTION
  async createReactions(data: Reaction): Promise<NewReaction> {
    return await db.transaction(async (tx) => {
      const [reaction] = await tx.insert(reactions).values(data).returning();
      return reaction;
    });
  },

  //   GET REACTION
  async getReaction({
    userId,
    postId,
  }: reactionProps): Promise<Reaction | undefined> {
    return await db.query.reactions.findFirst({
      where: and(eq(reactions.userId, userId), eq(reactions.postId, postId)),
      with: {
        author: true,
        post: true,
      },
    });
  },

  //   GET REACTION
  async getReactions(postId: string): Promise<Reaction[]> {
    return await db.query.reactions.findMany({
      where: eq(reactions.postId, postId),
      with: {
        author: true,
        post: true,
      },
    });
  },

  //   DELETE REACTION
  async deleteReaction({ userId, postId }: reactionProps): Promise<Reaction> {
    const [reaction] = await db.transaction(async (tx) => {
      return await tx
        .delete(reactions)
        .where(and(eq(reactions.userId, userId), eq(reactions.postId, postId)))
        .returning();
    });

    return reaction;
  },
};

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
  async getReaction({ userId, postId }: reactionProps): Promise<Reaction> {
    const [reaction] = await db
      .select()
      .from(reactions)
      .where(and(eq(reactions.userId, userId), eq(reactions.postId, postId)))
      .limit(1);

    return reaction;
  },

  //   GET REACTION
  async getReactions(postId: string): Promise<Reaction[]> {
    return await db
      .select()
      .from(reactions)
      .where(eq(reactions.postId, postId));
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

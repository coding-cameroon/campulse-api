import {
  Reaction,
  reactions,
  reactionTypeEnum,
} from "@/db/schema/reactions.js";
import {
  BadRequestError,
  InternalError,
  NotFoundError,
} from "@/errors/AppError.js";
import type { Request, Response, NextFunction } from "express";
import { reactionServices } from "./reaction.service.js";
import { postServices } from "../posts/post.service.js";

export const reactionController = {
  // CREATE REACTIONS
  async toggleReaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const { type } = req.query;
      const { id } = req.user;

      if (!postId) throw new BadRequestError("Provide a post to react on.");

      let reaction;
      let action: "deleted" | "created";

      const reactionExist = await reactionServices.getReaction({
        postId,
        userId: id,
      } as { userId: string; postId: string });

      if (!reactionExist) {
        if (!type) throw new BadRequestError("Provide a  reaction");

        if (!["like", "heart", "laugh", "sad"].includes(type as string))
          throw new BadRequestError(
            "Invalid reaction type (like,heart,laugh,sad).",
          );

        reaction = await reactionServices.createReactions({
          postId,
          type,
          userId: id,
        } as Reaction);
        action = "created";
      } else {
        reaction = await reactionServices.deleteReaction({
          postId,
          type,
          userId: id,
        } as Reaction);
        action = "deleted";
      }

      if (!reaction)
        throw new InternalError(
          `failed to ${action === "created" ? "create" : "delete"} reaction.`,
        );

      return res
        .status(action === "created" ? 201 : 200)
        .json({ success: true, data: reaction, message: `Reaction ${action}` });
    } catch (error) {
      next(error);
    }
  },

  //   GET REACTIONS
  async getReactions(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;

      if (!postId) throw new BadRequestError("Provide a post id.");

      const post = await postServices.getPost(postId as string);
      if (!post || (post.expiresAt && post.expiresAt > new Date()))
        throw new InternalError(`Error getting reactions.`);

      const reactions = await reactionServices.getReactions(post.id);
      if (!reactions)
        throw new InternalError("Failed to retrieved the reactions.");

      return res.status(200).json({
        success: true,
        data: reactions,
        message: "Reactions retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};

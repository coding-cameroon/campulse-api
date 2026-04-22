import { Reaction } from "@/db/schema/reactions.js";
import {
  BadRequestError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "@/errors/AppError.js";
import type { Request, Response, NextFunction } from "express";
import { reactionServices } from "./reaction.service.js";
import { postServices } from "../posts/post.service.js";
import { socketEvents } from "@/sockets/index.js";
import { getIO } from "@/config/socket.js";

const VALID_REACTIONS = ["like", "heart", "laugh", "sad"] as const;
type ReactionType = (typeof VALID_REACTIONS)[number];
type reactionProps = {
  postId: string;
  userId: string;
};

export const reactionController = {
  // TOGGLE REACTION
  async toggleReaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const { type } = req.body;
      const { id: userId } = req.user;

      const post = await postServices.getPost(postId as string);
      if (!post) throw new NotFoundError(`No post found with id: ${postId}`);

      if (post.expiresAt && post.expiresAt < new Date()) {
        throw new ForbiddenError("Cannot react to an expired post.");
      }

      const reactionExists = await reactionServices.getReaction({
        postId,
        userId,
      } as reactionProps);

      if (reactionExists) {
        const deleted = await reactionServices.deleteReaction({
          postId,
          userId,
        } as reactionProps);
        if (!deleted) throw new InternalError("Failed to delete reaction.");

        await postServices.updateReactionCount(postId as string, false);

        return res.status(200).json({
          success: true,
          data: deleted,
          message: "Reaction removed.",
        });
      }

      if (!type) throw new BadRequestError("Provide a reaction type.");
      if (!VALID_REACTIONS.includes(type as ReactionType)) {
        throw new BadRequestError(
          "Invalid reaction type. Use: like, heart, laugh or sad.",
        );
      }

      const createdReaction = await reactionServices.createReactions({
        postId,
        userId,
        type,
      } as Reaction);
      if (!createdReaction)
        throw new InternalError("Failed to create reaction.");
      const reactions = await reactionServices.getReactions(postId as string);
      await postServices.updateReactionCount(postId as string, true);

      res.status(201).json({
        success: true,
        data: createdReaction,
        message: "Reaction added.",
      });

      socketEvents.reactionUpdated(getIO(), {
        postId: postId as string,
        reactionCount: reactions.length || 0,
        action: reactionExists ? "deleted" : "created",
      });
    } catch (error) {
      next(error);
    }
  },

  // GET REACTIONS
  async getReactions(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;

      const post = await postServices.getPost(postId as string);
      if (!post) throw new NotFoundError(`No post found with id: ${postId}`);

      if (post.expiresAt && post.expiresAt < new Date()) {
        throw new ForbiddenError("This post has expired.");
      }

      const reactions = await reactionServices.getReactions(post.id);

      return res.status(200).json({
        success: true,
        data: reactions,
        meta: { count: reactions.length },
        message: "Reactions retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};

import { Request, Response, NextFunction } from "express";
import { commentServices } from "./comment.service.js";
import {
  BadRequestError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "@/errors/AppError.js";
import { getIO } from "@/config/socket.js";
import { Comment } from "@/db/schema/comments.js";
import { socketEvents } from "@/sockets/index.js";
import { postServices } from "@/modules/posts/post.service.js";

export const commentController = {
  // CREATE COMMENT
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const { postId } = req.params;
      const { comment } = req.body;

      if (!comment) throw new BadRequestError("Comment body is required.");

      const post = await postServices.getPost(postId as string);
      if (!post) throw new NotFoundError(`No post found with id: ${postId}`);

      const newComment = await commentServices.createComment({
        authorId: user.id,
        body: comment,
        postId,
        displayName:
          post.category === "feed"
            ? user.anonymousName
            : `${user.firstName} ${user.lastName}`,
        displayAvatarUrl:
          post.category === "feed"
            ? user.anonymousAvatarUrl
            : (user.realAvatarUrl ?? user.anonymousAvatarUrl),
      } as Comment);

      if (!newComment) throw new InternalError("Failed to create comment.");
      const comments = await commentServices.getComments(postId as string);

      res.status(201).json({
        success: true,
        data: newComment,
        message: "Comment created.",
      });

      socketEvents.commentCreated(getIO(), {
        comment: newComment,
        postId: newComment.postId,
        commentCount: comments.length || 0,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE COMMENT
  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;

      const comment = await commentServices.getComment(id as string);
      if (!comment) throw new NotFoundError(`No comment found with id: ${id}`);

      if (comment.authorId !== user.id && user.role !== "admin") {
        throw new ForbiddenError(
          "You are not permitted to delete this comment.",
        );
      }

      const deletedComment = await commentServices.deleteComment(id as string);
      if (!deletedComment) throw new InternalError("Failed to delete comment.");
      const comments = await commentServices.getComments(
        deletedComment.postId as string,
      );

      res.status(200).json({
        success: true,
        data: deletedComment,
        message: "Comment deleted successfully.",
      });

      socketEvents.commentDeleted(getIO(), {
        postId: comments[0].postId,
        commentId: deletedComment.id,
        commentCount: comments.length || 0,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET COMMENTS
  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const comments = await commentServices.getComments(
        postId as string,
        page,
        limit,
      );

      return res.status(200).json({
        success: true,
        data: comments,
        message: "Comments retrieved successfully",
        meta: {
          page,
          limit,
          count: comments.length,
          hasMore: comments.length === limit,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET COMMENT
  async getComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const comment = await commentServices.getComment(id as string);
      if (!comment) throw new NotFoundError(`No comment found with id: ${id}`);

      return res.status(200).json({
        success: true,
        data: comment,
        message: "Comment retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};

import { Request, Response, NextFunction } from "express";
import { commentServices } from "./comment.service.js";
import {
  BadRequestError,
  InternalError,
  NotFoundError,
  UnauthorizedError,
} from "@/errors/AppError.js";
import { Comment } from "@/db/schema/comments.js";

export const commentController = {
  // CREATE COMMENTS
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const { postId } = req.params;
      const { comment } = req.body;

      if (!postId) throw new BadRequestError("Provide a post to comment on.");
      if (!comment) throw new BadRequestError("Provide a comment to comment.");

      const data = { authorId: user.id, body: comment, postId } as Comment;
      const newComment = await commentServices.createComment(data);

      if (!newComment) throw new InternalError("Failed to create comment.");

      return res
        .status(201)
        .json({ success: true, data: newComment, message: "Comment created." });
    } catch (error) {
      next(error);
    }
  },

  //   DELETE COMMENTS
  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;

      const comment = await commentServices.getComment(id as string);
      if (!comment) throw new NotFoundError(`No comment found with id: ${id}`);

      if (user.id !== comment.authorId || user.role !== "admin")
        throw new UnauthorizedError(
          "You are not authorized to delete this comment.",
        );

      const deletedComment = await commentServices.deleteComment(id as string);
      if (!deletedComment) throw new InternalError("Failed to delete comment.");

      return res.status(200).json({
        success: true,
        data: deletedComment,
        message: "Comment deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  //   GET COMMENTS
  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { page, limit } = req.query;
      if (!id) throw new BadRequestError("Provide a post id.");

      const comments = await commentServices.getComments(
        id as string,
        Number(page),
        Number(limit),
      );
      if (!comments) throw new InternalError("Failed to get comments.");

      return res.status(200).json({
        success: true,
        data: comments,
        message: "Comments retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  //   GET COMMENTS
  async getComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new BadRequestError("Provide a comment id.");

      const comment = await commentServices.getComment(id as string);
      if (!comment) throw new InternalError("Failed to get comment.");

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

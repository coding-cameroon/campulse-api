import { postServices } from "./post.service.js";
import { expriryDate } from "@/utils/deteminDate.js";
import { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "@/errors/AppError.js";
import { mediaService } from "../media/media.service.js";
import { Post } from "@/db/schema/posts.js";
import { socketEvents } from "@/sockets/index.js";
import { getIO } from "@/config/socket.js";

export const postController = {
  // CREATE POST
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        category,
        body,
        title,
        isFree,
        price,
        collectAt,
        lastSeenAt,
        phoneNumber,
        itemStatus,
        eventLocation,
        eventStartAt,
        eventEndAt,
        mapCoordinates,
        eventCategory,
      } = req.body;

      console.log("[createPost] req.body:", req.body);
      console.log("[createPost] req.files:", req.files);
      console.log("[createPost] eventLocation:", eventLocation);

      const {
        id,
        anonymousName,
        anonymousAvatarUrl,
        firstName,
        lastName,
        realAvatarUrl,
      } = req.user;

      if (!category) throw new BadRequestError("Post category is required");
      if (!body) throw new BadRequestError("Post body is required");

      if (category === "event") {
        if (!title) throw new BadRequestError("Event title is required");
        if (!eventCategory)
          throw new BadRequestError("Provide event category.");
        if (!eventStartAt)
          throw new BadRequestError("Event start date is required");
        if (!eventEndAt)
          throw new BadRequestError("Event end date is required");
        if (!eventLocation)
          throw new BadRequestError("Event location is required");
        if (!mapCoordinates)
          throw new BadRequestError("Provide event geo coordinates");
        if (!isFree || !price)
          throw new BadRequestError("Provide event entry info.");
      }

      if (category === "lost_found") {
        if (!title) throw new BadRequestError("Lost & found title is required");
        if (!itemStatus)
          throw new BadRequestError("Item status (lost/found) is required");
        if (!collectAt)
          throw new BadRequestError("Provide an area to collect the item");
        if (!lastSeenAt)
          throw new BadRequestError("Provide last seen location");
        if (!phoneNumber) throw new BadRequestError("Provide a contact number");
      }

      const files = req.files as Express.Multer.File[];
      const uploads =
        files && files.length > 0
          ? await mediaService.uploadMultipleImages(files, "posts")
          : [];

      const imageUrls = uploads.map((r) => r.url);
      const imageFileIds = uploads.map((r) => r.fileId);

      const isAnon = category === "feed";
      const parsedEventStartAt = eventStartAt ? new Date(eventStartAt) : null;
      const parsedEventEndAt = eventEndAt ? new Date(eventEndAt) : null;

      const post = await postServices.createPost({
        body,
        title,
        category,
        imageUrls,
        imageFileIds,
        itemStatus,
        collectAt,
        lastSeenAt,
        phoneNumber,
        eventLocation,
        mapCoordinates,
        authorId: id,
        isFree,
        price,
        eventStartAt: parsedEventStartAt,
        eventEndAt: parsedEventEndAt,
        expiresAt: expriryDate(category, parsedEventEndAt),
        anonName: isAnon ? anonymousName : null,
        anonAvatarUrl: isAnon ? anonymousAvatarUrl : null,
        realName: !isAnon ? `${firstName} ${lastName}` : null,
        realAvatarUrl: !isAnon ? realAvatarUrl : null,
      });

      console.log(post);

      res.status(201).json({
        success: true,
        data: post,
        message: "Post created successfully",
      });

      socketEvents.postCreated(getIO(), post);
    } catch (err) {
      next(err);
    }
  },

  // GET POSTS
  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const category = req.query.category as Post["category"] | undefined;

      const validCategories = ["feed", "event", "lost_found"];
      if (category && !validCategories.includes(category)) {
        throw new BadRequestError(
          "Valid categories are: feed, event or lost_found",
        );
      }

      const posts = await postServices.getPosts({ page, limit, category });

      return res.status(200).json({
        success: true,
        data: posts,
        message: "Posts retrieved successfully",
        meta: {
          page,
          limit,
          count: posts.length,
          hasMore: posts.length === limit, // ✅ reliable without extra COUNT query
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET POST
  async getPost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const post = await postServices.getPost(id as string);
      if (!post) throw new NotFoundError(`No post found with id: ${id}`);

      return res.status(200).json({
        success: true,
        data: post,
        message: "Post retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE POST
  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;

      const postToDelete = await postServices.getPost(id as string);
      if (!postToDelete)
        throw new NotFoundError(`No post found with id: ${id}`);

      // ✅ Block if NOT the owner AND NOT an admin
      if (postToDelete.authorId !== user.id && user.role !== "admin") {
        throw new ForbiddenError("You are not permitted to delete this post.");
      }

      const deletedPost = await postServices.deletePost(postToDelete.id);
      if (!deletedPost) throw new InternalError("Failed to delete post.");

      if (deletedPost.imageFileIds && deletedPost.imageFileIds.length > 0) {
        await mediaService.deleteMultipleImages(
          deletedPost.imageFileIds as string[],
        );
      }

      res.status(200).json({
        success: true,
        data: deletedPost,
        message: "Post deleted successfully.",
      });

      socketEvents.postDeleted(getIO(), deletedPost.id as string);
    } catch (error) {
      next(error);
    }
  },
};

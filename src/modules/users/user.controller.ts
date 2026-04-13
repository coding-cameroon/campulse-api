import { generateAnonName } from "@/utils/anonymousName.js";
import { determineRole } from "@/utils/determineRole.js";
import { generateDicebearUrl } from "@/utils/dicebear.js";
import { clerkClient, getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { userServices } from "./user.service.js";
import {
  BadRequestError,
  ConflictError,
  InternalError,
  NotFoundError,
} from "@/errors/AppError.js";
import { mediaService } from "../media/media.service.js";

export const userController = {
  // SYNC USER DATA INTO DB
  async syncUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = getAuth(req);
      if (!userId) throw new BadRequestError("Clerk user id not provided.");

      const clerkUser = await clerkClient.users.getUser(userId);

      const userExist = await userServices.findByClerkId(clerkUser.id);
      if (userExist)
        res.status(209).json({
          success: true,
          data: userExist,
          message: "User already exist.",
        });

      // data
      const anonymousName = generateAnonName();
      const anonymousAvatarUrl = generateDicebearUrl(clerkUser.id);
      const email =
        clerkUser.primaryEmailAddress?.emailAddress ||
        clerkUser.emailAddresses[0].emailAddress;
      const role = determineRole(email);

      const userData = {
        role,
        email,
        anonymousName,
        anonymousAvatarUrl,
        clerkId: clerkUser.id,
        lastName: clerkUser.lastName,
        firstName: clerkUser.firstName,
        realAvatarUrl: clerkUser.imageUrl,
      };

      await clerkClient.users.updateUserMetadata(clerkUser.id, {
        publicMetadata: { role },
      });
      const newUser = await userServices.createUser(userData);
      res.status(201).json({
        success: true,
        data: newUser,
        message: "User synced successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // delete user
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await userServices.getUser(id as string);
      if (!user) throw new NotFoundError(`No user found with id: ${id}`);

      await clerkClient.users.deleteUser(user.clerkId);
      const deletedUser = await userServices.deleteUser(id as string);

      if (!deletedUser)
        throw new InternalError("Unable to delete user. Try again.");

      const imageKitRegex: RegExp = /^https:\/\/ik\.imagekit\.io\//;
      const isImageKitAvatarUrl =
        deletedUser.realAvatarUrl?.match(imageKitRegex);
      const isImageKitCoverAvatarUrl =
        deletedUser.coverAvatarUrl?.match(imageKitRegex);

      const imageKitDeleteIds = [
        isImageKitAvatarUrl && deletedUser.realAvatarUrlId,
        isImageKitCoverAvatarUrl && deletedUser.coverAvatarUrlId,
      ].filter(Boolean) as string[];

      try {
        await mediaService.deleteMultipleImages(imageKitDeleteIds as string[]);
      } catch (err) {
        throw new InternalError(
          `Error deleting images from imageKit.io: ${err}`,
        );
      }

      return res.status(200).json({
        success: true,
        data: deletedUser,
        message:
          "User deleted successfully and image cleared from imageKit.io storage.",
      });
    } catch (err) {
      next(err);
    }
  },

  // deactivate user
  async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await userServices.getUser(id as string);
      if (!user) throw new NotFoundError(`No user found with id: ${id}`);

      const newState = !user.isActive;

      const updatedUser = await userServices.toggleUserActiveState(
        id as string,
        newState,
      );

      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: `User ${newState ? "activated" : "deactivated"}`,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET USER
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user;

      const user = await userServices.getUser(id as string);
      if (!user) throw new NotFoundError(`User not found with id: ${id}`);

      return res
        .status(200)
        .json({ message: "Successfully retrieved user", data: user });
    } catch (error) {
      next(error);
    }
  },

  // GET USER
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await userServices.getUser(id as string);
      if (!user) throw new NotFoundError(`User not found with id: ${id}`);

      return res
        .status(200)
        .json({ message: "Successfully retrieved user", data: user });
    } catch (error) {
      next(error);
    }
  },

  // GET USERS
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;

      const queryOps = {
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      };
      const data = await userServices.getUsers(queryOps);
      return res
        .status(200)
        .json({ message: "Successfully retrieved users", data });
    } catch (error) {
      next(error);
    }
  },

  // UPDATE USER
  async updateProfileImage(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      const { id } = req.user;
      const { type } = req.query; // 'cover' or 'real'

      if (!file) throw new BadRequestError("Please upload an image file.");
      if (type !== "cover" && type !== "real") {
        throw new BadRequestError("Invalid type. Use 'cover' or 'real'.");
      }

      const currentUser = await userServices.getUser(id);
      if (!currentUser) throw new NotFoundError("User not found.");

      const urlKey = type === "cover" ? "coverAvatarUrl" : "realAvatarUrl";
      const idKey = type === "cover" ? "coverAvatarUrlId" : "realAvatarUrlId";
      const existingFileId = currentUser[idKey];

      if (existingFileId) {
        try {
          await mediaService.deleteImage(existingFileId);
        } catch (err) {
          throw new InternalError(`Failed to delete old image: ${err}`);
        }
      }

      // UPDATES IN CLERK
      const updatedClerkUserImage =
        type === "real" &&
        (await clerkClient.users.updateUserProfileImage(currentUser.clerkId, {
          file,
        } as any));
      if (type === "real" && !updatedClerkUserImage)
        throw new InternalError("Failed to process image update.");

      // UPLOAD TO IK
      const uploadResult = await mediaService.uploadImage(file, "avatars");
      if (!uploadResult)
        throw new InternalError("Failed to process image upload.");

      // UPDATE IN DB
      const updatedUser = await userServices.updateUserImages(id, {
        [urlKey]: uploadResult.url,
        [idKey]: uploadResult.fileId,
      });

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: "Profile image updated.",
      });
    } catch (error) {
      next(error);
    }
  },

  // UPDATE USER
  async updateName(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.user;
      const { firstname, lastname } = req.body;

      if (!firstname || !lastname) {
        throw new BadRequestError(
          "Provide your full name (first and last name).",
        );
      }

      const currentUser = await userServices.getUser(id);
      if (!currentUser) throw new NotFoundError("User not found.");

      const data = { firstName: firstname, lastName: lastname };
      const updatedClerkUser = await clerkClient.users.updateUser(
        currentUser.clerkId,
        data,
      );
      if (!updatedClerkUser)
        throw new InternalError("Failed to update your profile.");

      const updatedUser = await userServices.updateUser(currentUser.id, data);
      if (!updatedUser)
        throw new InternalError("Failed to update your profile.");

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: "Profile updated.",
      });
    } catch (error) {
      next(error);
    }
  },
};

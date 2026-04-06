import { generateAnonName } from "@/utils/anonymousName.js";
import { determineRole } from "@/utils/determineRole.js";
import { generateDicebearUrl } from "@/utils/dicebear.js";
import { clerkClient, getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { userServices } from "./user.service.js";
import { InternalError, NotFoundError } from "@/errors/AppError.js";

export const userController = {
  // SYNC USER DATA INTO DB
  async syncUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = getAuth(req);

      const clerkUser = await clerkClient.users.getUser(userId || "");

      // data
      const anonymousName = generateAnonName();
      const anonymousAvatarUrl = generateDicebearUrl(clerkUser.id);
      const email =
        clerkUser.primaryEmailAddress?.emailAddress ||
        clerkUser.emailAddresses[0].emailAddress;

      const userData = {
        email,
        anonymousName,
        clerkId: clerkUser.id,
        anonymousAvatarUrl,
        lastName: clerkUser.lastName,
        firstName: clerkUser.firstName,
        role: determineRole(email),
        realAvatarUrl: clerkUser.imageUrl,
      };

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

      // ! delete user image url from the cloud storage provider

      if (!deletedUser)
        throw new InternalError("Unable to delete user. Try again.");

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: deletedUser,
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
        message: `User ${newState ? "deactivated" : "activated"}`,
      });
    } catch (err) {
      next(err);
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
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {
      next(error);
    }
  },
};

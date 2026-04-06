import type { NextFunction, Request, Response } from "express";
import { userServices } from "@/modules/users/user.service.js";
import { NotFoundError, UnauthorizedError } from "@/errors/AppError.js";
import { getAuth } from "@clerk/express";

export const requireAuth = async (
  req: Request,
  _: Response,
  next: NextFunction,
) => {
  try {
    const { userId, isAuthenticated } = getAuth(req);

    if (!isAuthenticated) throw new UnauthorizedError("Not authenticated");

    const user = await userServices.findByClerkId(userId);
    if (!user) throw new NotFoundError("User account doesn't exist");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

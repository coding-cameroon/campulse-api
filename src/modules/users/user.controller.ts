import { NextFunction, Request, Response } from "express";

export const userController = {
  // SYNC USER DATA INTO DB
  async syncUser(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {
      next(error);
    }
  },
};

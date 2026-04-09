// PACKAGE IMPORTS
import cors from "cors";
import express from "express";
import type { Request, Response } from "express";
import { clerkMiddleware } from "@clerk/express";

// CONFIG
import { PORT } from "@/config/env";
import { connectDB } from "@/config/db";

// ROUTES
import { userRouter } from "./modules/users/user.route.js";
import { postRouter } from "./modules/posts/post.route.js";
import { commentRouter } from "./modules/comments/comment.route.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import { reactionRouter } from "./modules/reactions/reaction.route.js";

const app = express();

// MIDDLEWARES
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());
app.use(clerkMiddleware());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.get("/", (_: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Server running" });
});
app.use("/v1/api/users", userRouter);
app.use("/v1/api/posts", postRouter);
app.use("/v1/api/comments", commentRouter);
app.use("/v1/api/reactions", reactionRouter);

// last middleware to be used
app.use(globalErrorHandler);

export const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on  http://localhost:${PORT}`);
  });
};

startServer();

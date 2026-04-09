// PACKAGE IMPORTS
import cors from "cors";
import express from "express";
import { createServer } from "http";
import type { Request, Response } from "express";
import { clerkMiddleware } from "@clerk/express";

// CONFIG
import { CLIENT_URL, ENABLE_CRON, PORT } from "@/config/env";
import { connectDB } from "@/config/db";

// ROUTES
import { userRouter } from "./modules/users/user.route.js";
import { postRouter } from "./modules/posts/post.route.js";
import { commentRouter } from "./modules/comments/comment.route.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import { reactionRouter } from "./modules/reactions/reaction.route.js";

// LOGGER & JOBS
import { logger } from "./logger/logger.js";
import { startCronJobs } from "./jobs/post.cron.js";
import { initSocketIo } from "./config/socket.js";

// SERVER
const app = express();
const server = createServer(app);

// MIDDLEWARES
app.use(
  cors({
    credentials: true,
    origin: CLIENT_URL || "*",
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

// ROUTES
app.get("/", (_: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Server running" });
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/reactions", reactionRouter);

// 404 ROUTES
app.use((_: Request, res: Response) => {
  return res
    .status(404)
    .json({ successs: false, message: "ROUTE NOT FOUND.", statusCode: 404 });
});

// last middleware to be used
app.use(globalErrorHandler);

export const startServer = async () => {
  try {
    await connectDB();
    initSocketIo(server);

    server.listen(PORT, () => {
      logger.log("info", `Server running on  http://localhost:${PORT}`);

      if (ENABLE_CRON === "true") {
        startCronJobs();
        logger.info("CRON_JOB STARTED.");
      }
    });
  } catch (err) {
    logger.error("Failed to start server: ", err);
    process.exit(1);
  }
};

startServer();

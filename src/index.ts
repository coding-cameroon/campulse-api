import express from "express";
import type { Request, Response } from "express";
import { clerkMiddleware } from "@clerk/express";

import { PORT } from "@/config/env";
import { connectDB } from "@/config/db";
import { globalErrorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(clerkMiddleware());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Server running" });
});

// last middleware to be used
app.use(globalErrorHandler);

export const startServer = async () => {
  // await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on  http://localhost:${PORT}`);
  });
};

startServer();

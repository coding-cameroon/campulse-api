import { Server } from "socket.io";
import { createServer } from "http";
import { CLIENT_URL } from "./env.js";
import { logger } from "@/logger/logger.js";

let io: Server;

export const initSocketIo = (httpServer: ReturnType<typeof createServer>) => {
  io = new Server(httpServer, {
    cors: {
      origin: CLIENT_URL || "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    logger.info(`⚡ Socket connected with ID: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      logger.info(
        `🔌 Socket disconnected with ID: ${socket.id}, because of: ${reason}`,
      );
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};

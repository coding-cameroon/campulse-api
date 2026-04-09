import { Server } from "socket.io";

export const socketEvents = {
  // ----------------------POST EVENTS------------------------ //
  // post created
  postCreated(io: Server, data: object) {
    io.emit("post:new", data);
  },

  //   post deleted
  postDeleted(io: Server, postId: string) {
    io.emit("post:removed", { postId });
  },

  // ----------------------REACTION EVENTS------------------------ //
  //   update reaction
  reactionUpdated: (
    io: Server,
    data: {
      postId: string;
      reactionCount: number;
      action: "created" | "deleted";
    },
  ) => {
    io.emit("reaction:updated", data);
  },

  // ----------------------COMMENT EVENTS------------------------ //
  //   COMMENT CREATED
  commentCreated: (
    io: Server,
    data: {
      postId: string;
      comment: object;
      commentCount: number;
    },
  ) => {
    io.emit("comment:new", data);
  },

  //   COMMENT DELETED
  commentDeleted: (
    io: Server,
    data: {
      postId: string;
      commentId: string;
      commentCount: number;
    },
  ) => {
    io.emit("comment:removed", data);
  },

  // ----------------------POST EXPIRED EVENTS------------------------ //
  //   EXPIRED POST
  postExpired: (io: Server, data: object) => {
    io.emit("post:expired", data);
  },
};

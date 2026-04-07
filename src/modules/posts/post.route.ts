import { Router } from "express";
import { postController } from "./post.controller.js";
import { upload } from "@/middlewares/upload.middleware.js";
import { requireAuth } from "@/middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/new",
  requireAuth,
  upload.array("images", 5),
  postController.createPost,
);
router.get("/", requireAuth, postController.getPosts);
router.get("/:id", requireAuth, postController.getPost);
router.delete("/:id", requireAuth, postController.deletePost);

export { router as postRouter };

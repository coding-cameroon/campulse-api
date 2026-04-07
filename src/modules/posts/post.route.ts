import { requireAuth } from "@/middlewares/auth.middleware.js";
import { Router } from "express";
import { postController } from "./post.controller.js";

const router = Router();

router.get("/", requireAuth, postController.getPosts);
router.get("/:id", requireAuth, postController.getPost);
router.post("/new", requireAuth, postController.createPost);
router.delete("/:id", requireAuth, postController.deletePost);

export { router as postRouter };

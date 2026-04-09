import { requireAuth } from "@/middlewares/auth.middleware.js";
import { Router } from "express";
import { commentController } from "./comment.controller.js";

const router = Router();

router.get("/:id", requireAuth, commentController.getComment);
router.get("/:id/post", requireAuth, commentController.getComments);
router.delete("/:id", requireAuth, commentController.deleteComment);
router.post("/create", requireAuth, commentController.createComment);

export { router as commentRouter };

import { Router } from "express";
import { reactionController } from "./reaction.controller.js";
import { requireAuth } from "@/middlewares/auth.middleware.js";

const router = Router();

router.get("/:postId", requireAuth, reactionController.getReactions);
router.post("/upsert/:postId", requireAuth, reactionController.toggleReaction);

export { router as reactionRouter };

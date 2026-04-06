import { Router } from "express";
import { userController } from "./user.controller.js";
import { requireAuth } from "@/middlewares/auth.middleware.js";
import { permit } from "@/middlewares/permission.middleware.js";

const router = Router();

router.delete(
  "/:id/delete",
  requireAuth,
  permit("admin"),
  userController.deleteUser,
);
router.patch(
  "/:id/deactivate",
  requireAuth,
  permit("admin"),
  userController.deleteUser,
);
router.post("/sync", userController.syncUser);
router.put("/:id", requireAuth, userController.getUser);
router.get("/", requireAuth, permit("admin"), userController.getUsers);
router.get("/:id", requireAuth, permit("admin"), userController.getUser);

export { router as UserRouter };

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
router.get("/:id", requireAuth, userController.getUser);
router.put("/:id", requireAuth, userController.updateUser);
router.get("/", requireAuth, permit("admin"), userController.getUsers);

export { router as userRouter };

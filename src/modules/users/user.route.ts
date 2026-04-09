import { Router } from "express";
import { userController } from "./user.controller.js";
import { requireAuth } from "@/middlewares/auth.middleware.js";
import { permit } from "@/middlewares/permission.middleware.js";
import { upload } from "@/middlewares/upload.middleware.js";

const router = Router();

router.delete(
  "/:id/delete",
  requireAuth,
  permit("admin"),
  userController.deleteUser,
);
router.put(
  "/update/profile-image",
  requireAuth,
  upload.single("avatar"),
  userController.updateProfileImage,
);
router.post("/sync", userController.syncUser);
router.get("/me", requireAuth, userController.getMe);
router.get("/:id", requireAuth, userController.getUser);
router.get("/", requireAuth, permit("admin"), userController.getUsers);
router.put("/update/profile-name", requireAuth, userController.updateName);
router.patch("/:id/deactivate", requireAuth, userController.deactivateUser);

export { router as userRouter };

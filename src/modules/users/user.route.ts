import { Router } from "express";
import { userController } from "./user.controller.js";

const router = Router();

router.post("/sync", userController.syncUser);

export { router as UserRouter };

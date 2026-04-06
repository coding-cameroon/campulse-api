import express, { Router } from "express";
import { userWebhook } from "./webhook.controller.js";

const router = Router();

router.post(
  "/webhooks",
  express.raw({ type: "application/json" }),
  userWebhook,
);

export { router as webHookRouter };

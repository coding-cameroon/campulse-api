import type { Request, Response } from "express";
import { verifyWebhook } from "@clerk/express/webhooks";

export const userWebhook = async (req: Request, res: Response) => {
  try {
    const evt = await verifyWebhook(req);

    const { id } = evt.data;
    const eventType = evt.type;
    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`,
    );

    console.log("Webhook payload:", evt.data);
    return res.status(200).json({ data: evt.data });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return res.status(400).send("Error verifying webhook");
  }
};

import type { NextFunction, Request, Response } from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import { generateAnonName } from "@/utils/anonymousName.js";
import { generateDicebearUrl } from "@/utils/dicebear.js";
import { determineRole } from "@/utils/determineRole.js";
import { userServices } from "../users/user.service.js";

export const userWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const evt = await verifyWebhook(req);

    const entType = evt.type;

    let user = null;
    if (entType === "user.created") {
      const { id, image_url, first_name, last_name, email_addresses } =
        evt.data;

      const anonName = generateAnonName();
      const anonAvatar = generateDicebearUrl(id);
      const role = determineRole(email_addresses[0].email_address);

      const userData = {
        role,
        clerkId: id,
        lastName: last_name,
        firstName: first_name,
        anonymousName: anonName,
        realAvatarUrl: image_url,
        anonymousAvatarUrl: anonAvatar,
        email: email_addresses[0].email_address,
      };

      user = await userServices.createUser(userData);
    }

    if (evt.type === "user.deleted") {
      const { id } = evt.data;

      user = await userServices.deactivateUser(id!);
    }

    return res.status(200).json({
      data: user,
      success: true,
      eventType: evt.type,
      message: "Webhook processed successfully",
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    next(err);
  }
};

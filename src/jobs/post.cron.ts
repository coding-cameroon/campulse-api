import cron from "node-cron";
import { logger } from "@/logger/logger.js";
import { InternalError } from "@/errors/AppError.js";
import { mediaService } from "@/modules/media/media.service.js";
import { postServices } from "@/modules/posts/post.service.js";

const postCronExpiry = () => {
  cron.schedule("* * * * *", async () => {
    try {
      // check if post exist
      const expiredPosts = await postServices.getExpiredPost();
      if (!expiredPosts || expiredPosts.length === 0) return;

      //   delete images from ik
      const expiredPostsImageIds = expiredPosts
        .flatMap((post) => post.imageFileIds || [])
        .filter(Boolean);
      if (expiredPostsImageIds.length > 0) {
        try {
          await mediaService.deleteMultipleImages(expiredPostsImageIds);
          logger.info(
            `Deleted ${expiredPostsImageIds.length} image(s) from ImageKit`,
          );
        } catch (err) {
          logger.error("Failed to delete images from ImageKit", err);
        }
      }

      // update if exist
      const updatedExpiredPosts = await postServices.updateExpiredPosts();
      if (!updatedExpiredPosts)
        throw new InternalError("Failed to update expired posts.");

      logger.info(
        `Expired ${updatedExpiredPosts.length} post(s): ${updatedExpiredPosts
          .map((p) => p.id)
          .join(", ")}`,
      );
    } catch (err) {
      logger.error("Post expiry cron failed", err);
    }
  });
};

const startPostCleanupJob = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      const deletedPosts = await postServices.deleteExpiredPost();

      if (deletedPosts.length > 0) {
        logger.info(`Deleted ${deletedPosts.length} expired posts`);
      }
    } catch (error) {
      logger.error("Post cleanup cron failed", error);
    }
  });
};

export const startCronJobs = () => {
  postCronExpiry();
  startPostCleanupJob();
};

import { Post } from "@/db/schema";

export const expriryDate = (
  category: Post["category"],
  eventEndAt?: Date | null,
) => {
  const date = new Date();

  switch (category) {
    case "feed":
      return new Date(date.getTime() + 1000 * 60 * 60 * 24);

    case "event":
      // expires when event ends
      if (!eventEndAt) throw new Error("eventEndAt is required for events");
      return eventEndAt;

    case "lost_found":
      return new Date(date.getTime() + 1000 * 60 * 60 * 24 * 7);
  }
};

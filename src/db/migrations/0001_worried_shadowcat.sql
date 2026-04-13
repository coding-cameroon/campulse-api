CREATE TYPE "public"."event_category" AS ENUM('Academic', 'Tech', 'Social', 'Career', 'Sports');--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "price" integer;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "event_category" "event_category";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "is_free" boolean DEFAULT true;
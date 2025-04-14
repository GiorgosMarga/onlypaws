ALTER TABLE "onlypaws"."users" ALTER COLUMN "is_banned" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "onlypaws"."users" ALTER COLUMN "is_verified" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "onlypaws"."users" ADD COLUMN "has_finished_profile" boolean DEFAULT false;
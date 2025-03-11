ALTER TABLE "onlypaws"."users" ADD COLUMN "google_id" varchar;--> statement-breakpoint
ALTER TABLE "onlypaws"."users" ADD CONSTRAINT "users_google_id_unique" UNIQUE("google_id");
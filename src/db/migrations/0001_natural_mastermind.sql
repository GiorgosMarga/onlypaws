ALTER TABLE "onlypaws"."users" ADD COLUMN "profilePic" varchar(255);--> statement-breakpoint
ALTER TABLE "onlypaws"."users" ADD COLUMN "birth_date" date;--> statement-breakpoint
ALTER TABLE "onlypaws"."users" ADD COLUMN "last_login" date;--> statement-breakpoint
ALTER TABLE "onlypaws"."users" ADD COLUMN "is_banned" boolean DEFAULT false;
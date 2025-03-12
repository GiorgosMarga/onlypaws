ALTER TABLE "onlypaws"."user_info" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "onlypaws"."user_info" ADD COLUMN "dog_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "onlypaws"."user_info" ADD COLUMN "dog_age" integer;--> statement-breakpoint
ALTER TABLE "onlypaws"."user_info" ADD COLUMN "dog_breed" varchar(255);
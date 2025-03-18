ALTER TABLE "onlypaws"."user_info" DROP CONSTRAINT "user_info_id_userId_pk";--> statement-breakpoint
ALTER TABLE "onlypaws"."user_info" ADD PRIMARY KEY ("userId");--> statement-breakpoint
ALTER TABLE "onlypaws"."users" ADD COLUMN "github_id" varchar;--> statement-breakpoint
ALTER TABLE "onlypaws"."user_info" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "onlypaws"."users" ADD CONSTRAINT "users_github_id_unique" UNIQUE("github_id");
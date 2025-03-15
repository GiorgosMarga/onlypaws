ALTER TABLE "onlypaws"."refresh_tokens" DROP CONSTRAINT "refresh_tokens_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "onlypaws"."post_analytics" ALTER COLUMN "likes" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "onlypaws"."posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "onlypaws"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "onlypaws"."users"("id") ON DELETE cascade ON UPDATE no action;
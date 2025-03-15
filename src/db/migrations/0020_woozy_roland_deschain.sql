ALTER TABLE "onlypaws"."posts" DROP CONSTRAINT "posts_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "onlypaws"."post_likes" ADD CONSTRAINT "post_likes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "onlypaws"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "onlypaws"."users"("id") ON DELETE cascade ON UPDATE no action;
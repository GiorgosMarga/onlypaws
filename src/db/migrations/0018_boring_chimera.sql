CREATE TABLE "onlypaws"."post_analytics" (
	"postId" uuid PRIMARY KEY NOT NULL,
	"likes" integer DEFAULT 1
);
--> statement-breakpoint
ALTER TABLE "onlypaws"."post_analytics" ADD CONSTRAINT "post_analytics_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "onlypaws"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."post_likes" ADD CONSTRAINT "post_likes_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "onlypaws"."posts"("id") ON DELETE no action ON UPDATE no action;
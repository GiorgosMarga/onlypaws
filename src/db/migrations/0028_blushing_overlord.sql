ALTER TABLE "onlypaws"."post_analytics" DROP CONSTRAINT "post_analytics_postId_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "onlypaws"."post_analytics" ADD COLUMN "comments" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "onlypaws"."post_analytics" ADD COLUMN "shares" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "onlypaws"."post_analytics" ADD COLUMN "views" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "onlypaws"."post_analytics" ADD CONSTRAINT "post_analytics_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "onlypaws"."posts"("id") ON DELETE cascade ON UPDATE no action;
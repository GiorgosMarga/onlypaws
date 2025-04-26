CREATE UNIQUE INDEX "analytics_post_id" ON "onlypaws"."post_analytics" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_user_id" ON "onlypaws"."posts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "post_id" ON "onlypaws"."posts" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_id" ON "onlypaws"."user_info" USING btree ("user_id");
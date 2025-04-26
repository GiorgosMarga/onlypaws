DROP INDEX "onlypaws"."post_user_id";--> statement-breakpoint
CREATE INDEX "post_user_id" ON "onlypaws"."posts" USING btree ("user_id");
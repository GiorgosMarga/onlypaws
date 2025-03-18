ALTER TABLE "onlypaws"."user_info" DROP CONSTRAINT "user_info_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "onlypaws"."user_info" ADD CONSTRAINT "user_info_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "onlypaws"."users"("id") ON DELETE cascade ON UPDATE no action;
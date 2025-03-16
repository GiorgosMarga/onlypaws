CREATE TABLE "onlypaws"."followers" (
	"following_user_id" uuid NOT NULL,
	"follower_user_id" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "followers_follower_user_id_following_user_id_pk" PRIMARY KEY("follower_user_id","following_user_id")
);
--> statement-breakpoint
ALTER TABLE "onlypaws"."followers" ADD CONSTRAINT "followers_following_user_id_users_id_fk" FOREIGN KEY ("following_user_id") REFERENCES "onlypaws"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."followers" ADD CONSTRAINT "followers_follower_user_id_users_id_fk" FOREIGN KEY ("follower_user_id") REFERENCES "onlypaws"."users"("id") ON DELETE cascade ON UPDATE no action;
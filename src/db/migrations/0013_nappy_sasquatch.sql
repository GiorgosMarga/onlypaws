CREATE TABLE "onlypaws"."user_info" (
	"id" uuid DEFAULT gen_random_uuid(),
	"userId" uuid NOT NULL,
	"birth_date" timestamp NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "user_info_id_userId_pk" PRIMARY KEY("id","userId")
);
--> statement-breakpoint
ALTER TABLE "onlypaws"."user_info" ADD CONSTRAINT "user_info_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "onlypaws"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."users" DROP COLUMN "birth_date";
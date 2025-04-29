CREATE TABLE "onlypaws"."messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from" uuid,
	"to" uuid,
	"content" varchar,
	"created_at" timestamp DEFAULT now(),
	"read_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "onlypaws"."messages" ADD CONSTRAINT "messages_from_users_id_fk" FOREIGN KEY ("from") REFERENCES "onlypaws"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."messages" ADD CONSTRAINT "messages_to_users_id_fk" FOREIGN KEY ("to") REFERENCES "onlypaws"."users"("id") ON DELETE no action ON UPDATE no action;
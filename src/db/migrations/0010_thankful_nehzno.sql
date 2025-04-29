CREATE TABLE "onlypaws"."conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_1" uuid NOT NULL,
	"user_2" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "onlypaws"."messages" ALTER COLUMN "from" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "onlypaws"."messages" ALTER COLUMN "to" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "onlypaws"."messages" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "onlypaws"."messages" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "onlypaws"."messages" ADD COLUMN "conversation_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "onlypaws"."conversations" ADD CONSTRAINT "conversations_user_1_users_id_fk" FOREIGN KEY ("user_1") REFERENCES "onlypaws"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."conversations" ADD CONSTRAINT "conversations_user_2_users_id_fk" FOREIGN KEY ("user_2") REFERENCES "onlypaws"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "onlypaws"."conversations"("id") ON DELETE no action ON UPDATE no action;
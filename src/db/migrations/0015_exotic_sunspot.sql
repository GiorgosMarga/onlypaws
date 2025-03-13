CREATE TABLE "onlypaws"."posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tags" varchar(255)[] DEFAULT '{}',
	"description" text,
	"mediaUrl" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

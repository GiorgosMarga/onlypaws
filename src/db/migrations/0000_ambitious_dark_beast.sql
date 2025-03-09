CREATE TYPE "onlypaws"."userRole" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "onlypaws"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(256) NOT NULL,
	"userRole" "onlypaws"."userRole" DEFAULT 'USER' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "emailIndex" ON "onlypaws"."users" USING btree ("email");
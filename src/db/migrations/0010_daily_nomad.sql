CREATE TABLE "onlypaws"."password_tokens" (
	"token" varchar(32) NOT NULL,
	"userId" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp DEFAULT NOW() + INTERVAL '5 minutes' NOT NULL,
	CONSTRAINT "password_tokens_userId_token_pk" PRIMARY KEY("userId","token")
);
--> statement-breakpoint
ALTER TABLE "onlypaws"."password_tokens" ADD CONSTRAINT "password_tokens_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "onlypaws"."users"("id") ON DELETE no action ON UPDATE no action;
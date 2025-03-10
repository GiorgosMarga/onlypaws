CREATE TABLE "onlypaws"."otps" (
	"userId" uuid,
	"otp" real,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "otps_otp_userId_pk" PRIMARY KEY("otp","userId")
);
--> statement-breakpoint
ALTER TABLE "onlypaws"."otps" ADD CONSTRAINT "otps_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "onlypaws"."users"("id") ON DELETE no action ON UPDATE no action;
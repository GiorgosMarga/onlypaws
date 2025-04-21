CREATE SCHEMA IF NOT EXISTS "onlypaws";
--> statement-breakpoint
-- CREATE TYPE IF NOT EXISTS "onlypaws"."userRole" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onlypaws"."comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onlypaws"."followers" (
	"following_user_id" uuid NOT NULL,
	"follower_user_id" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "followers_follower_user_id_following_user_id_pk" PRIMARY KEY("follower_user_id","following_user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onlypaws"."otps" (
	"user_id" uuid NOT NULL,
	"otp" real,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "otps_otp_user_id_pk" PRIMARY KEY("otp","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onlypaws"."password_tokens" (
	"token" varchar(32) NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp DEFAULT NOW() + INTERVAL '5 minutes' NOT NULL,
	CONSTRAINT "password_tokens_user_id_token_pk" PRIMARY KEY("user_id","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onlypaws"."post_analytics" (
	"post_id" uuid PRIMARY KEY NOT NULL,
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"saves" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"views" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onlypaws"."post_likes" (
	"user_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "post_likes_user_id_post_id_pk" PRIMARY KEY("user_id","post_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onlypaws"."post_saves" (
	"user_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "post_saves_user_id_post_id_pk" PRIMARY KEY("user_id","post_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onlypaws"."posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tags" varchar(255)[] DEFAULT '{}',
	"description" text,
	"media_url" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onlypaws"."refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"is_revoked" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onlypaws"."user_info" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"birth_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"bio" text,
	"dog_name" varchar(255) DEFAULT 'Unknown' NOT NULL,
	"name" varchar(255) NOT NULL,
	"dog_age" integer,
	"dog_breed" varchar(255),
	"user_avatar" varchar,
	"dog_avatar" varchar,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onlypaws"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_id" varchar,
	"github_id" varchar,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(256),
	"role" "onlypaws"."userRole" DEFAULT 'USER' NOT NULL,
	"profile_pic" varchar(255),
	"last_login" date,
	"is_banned" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"has_finished_profile" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_github_id_unique" UNIQUE("github_id")
);
--> statement-breakpoint
ALTER TABLE "onlypaws"."comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "onlypaws"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "onlypaws"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "onlypaws"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."followers" ADD CONSTRAINT "followers_following_user_id_users_id_fk" FOREIGN KEY ("following_user_id") REFERENCES "onlypaws"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."followers" ADD CONSTRAINT "followers_follower_user_id_users_id_fk" FOREIGN KEY ("follower_user_id") REFERENCES "onlypaws"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."otps" ADD CONSTRAINT "otps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "onlypaws"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."password_tokens" ADD CONSTRAINT "password_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "onlypaws"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."post_analytics" ADD CONSTRAINT "post_analytics_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "onlypaws"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "onlypaws"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "onlypaws"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."post_saves" ADD CONSTRAINT "post_saves_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "onlypaws"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."post_saves" ADD CONSTRAINT "post_saves_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "onlypaws"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "onlypaws"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "onlypaws"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onlypaws"."user_info" ADD CONSTRAINT "user_info_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "onlypaws"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "emailIndex" ON "onlypaws"."users" USING btree ("email");--> statement-breakpoint
CREATE VIEW "onlypaws"."posts_view" AS (select "onlypaws"."post_analytics"."likes", "onlypaws"."posts"."id", "onlypaws"."posts"."user_id", "onlypaws"."posts"."tags", "onlypaws"."posts"."description", "onlypaws"."posts"."media_url", "onlypaws"."posts"."created_at", "onlypaws"."posts"."updated_at", "onlypaws"."post_analytics"."comments", "onlypaws"."post_analytics"."views", "onlypaws"."user_info"."dog_name", "onlypaws"."user_info"."name", "onlypaws"."user_info"."user_avatar", "onlypaws"."user_info"."dog_avatar" from "onlypaws"."posts" inner join "onlypaws"."user_info" on "onlypaws"."user_info"."user_id" = "onlypaws"."posts"."user_id" inner join "onlypaws"."post_analytics" on "onlypaws"."post_analytics"."post_id" = "onlypaws"."posts"."id" order by "onlypaws"."posts"."created_at" desc);
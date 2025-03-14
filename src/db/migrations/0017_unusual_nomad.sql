CREATE TABLE "onlypaws"."post_likes" (
	"userId" uuid NOT NULL,
	"postId" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "post_likes_userId_postId_pk" PRIMARY KEY("userId","postId")
);

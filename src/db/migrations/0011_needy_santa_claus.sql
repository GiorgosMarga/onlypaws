ALTER TABLE "onlypaws"."conversations" ADD CONSTRAINT "unique_users_pair" UNIQUE("user_1","user_2");
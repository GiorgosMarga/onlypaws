import { primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { schema } from "./users";

export const postLikesTable = schema.table("post_likes", {
    userId: uuid().notNull(),
    postId: uuid().notNull(),
    createdAt: timestamp("created_at").defaultNow()
}, (table) => [
    primaryKey({columns: [table.userId, table.postId]})
])


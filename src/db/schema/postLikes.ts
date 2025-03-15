import { integer, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { schema, usersTable } from "./users";
import { postsTable } from "./posts";

export const postLikesTable = schema.table("post_likes", {
    userId: uuid().notNull().references(() => usersTable.id,{ onDelete: "cascade" }),
    postId: uuid().notNull().references(() => postsTable.id),
    createdAt: timestamp("created_at").defaultNow()
}, (table) => [
    primaryKey({columns: [table.userId, table.postId]}),
])

export const postAnalyticsTable = schema.table("post_analytics", {
    postId: uuid().references(()=>postsTable.id).primaryKey(),
    likes: integer().default(0),
})
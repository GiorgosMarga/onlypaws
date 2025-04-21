import { integer, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { schema, usersTable } from "./users";
import { postsTable } from "./posts";

export const postLikesTable = schema.table("post_likes", {
    userId: uuid("user_id").notNull().references(() => usersTable.id,{ onDelete: "cascade" }),
    postId: uuid("post_id").notNull().references(() => postsTable.id,{ onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow()
}, (table) => [
    primaryKey({columns: [table.userId, table.postId]}),
])


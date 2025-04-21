import { primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { schema, usersTable } from "./users";
import { postsTable } from "./posts";

export const postSavesTable = schema.table("post_saves", { 
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    postId: uuid("post_id").notNull().references(() => postsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow()
}, (table) => [
    primaryKey({ columns: [table.userId, table.postId] }),
])

import { integer, text, timestamp, uuid } from "drizzle-orm/pg-core"
import {schema, usersTable} from "./users"
import { postsTable } from "./posts"
export const commentsTable = schema.table("comments", {
    id: uuid().notNull().defaultRandom().primaryKey(),
    postId: uuid("post_id").notNull().references(() => postsTable.id , {onDelete: "cascade"}),
    userId: uuid("user_id").notNull().references(() => usersTable.id , {onDelete: "cascade"}),
    content: text().notNull(),
    parentId: uuid("parent_id").references(()=> commentsTable.id, {onDelete: "cascade"}),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
})
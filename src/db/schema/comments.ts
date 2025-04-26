// @ts-nocheck 
import { integer, text, timestamp, uuid } from "drizzle-orm/pg-core"
import {schema, usersTable} from "./users"
import { postsTable } from "./posts"


export const commentsTable = schema.table("comments", (table ) =>{
    return {
        id: uuid("id").notNull().defaultRandom().primaryKey(),
        postId: uuid("post_id").notNull().references(() => postsTable.id , {onDelete: "cascade"}),
        userId: uuid("user_id").notNull().references(() => usersTable.id , {onDelete: "cascade"}),
        content: text("content").notNull(),
        parentId: uuid("parent_id").references(()=> commentsTable.id, {onDelete: "cascade"}),
        mainCommentId: uuid("main_comment_id").references(()=> commentsTable.id, {onDelete: "cascade"}),
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
    }
})
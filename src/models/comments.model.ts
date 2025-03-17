import {commentsTable} from "../db/schema/comments"
export type CommentInsert = typeof commentsTable.$inferInsert
export type Comment = typeof commentsTable.$inferSelect

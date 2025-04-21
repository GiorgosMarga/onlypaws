import { postsTable } from "../db/schema/posts";

export type Post = typeof postsTable.$inferSelect
export type PostInsert = typeof postsTable.$inferInsert


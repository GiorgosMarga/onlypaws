import { integer, uuid } from "drizzle-orm/pg-core";
import { postsTable } from "./posts";
import { schema } from "./users";

export const postAnalyticsTable = schema.table("post_analytics", {
    postId: uuid("post_id").references(()=>postsTable.id, {onDelete: "cascade"}).primaryKey(),
    likes: integer().default(0),
    comments: integer().default(0),
    saves: integer().default(0),
    shares: integer().default(0),
    views: integer().default(0),
})
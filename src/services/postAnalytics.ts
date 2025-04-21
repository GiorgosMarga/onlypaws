import { eq, sql } from "drizzle-orm"
import { db } from "../db"
import { postAnalyticsTable } from "../db/schema/postAnalytics"
import { PgTransaction } from "drizzle-orm/pg-core"
import { NodePgDatabase, NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
type DBLike = PgTransaction<NodePgQueryResultHKT, any, any> | NodePgDatabase<any>;

const updatePostAnalytics = async (
  postId: string,
  column: "likes" | "comments" | "shares" | "views",
  increment: boolean
) => {
  await db
    .update(postAnalyticsTable)
    .set({
      [column]: sql`${postAnalyticsTable[column]} ${increment ? sql`+` : sql`-`} 1`
    })
    .where(eq(postAnalyticsTable.postId, postId));
};

const updatePostAnalyticsWithTx = async (
  tx: DBLike,
postId: string,
  column: "likes" | "comments" | "shares" | "views" | "saves",
  increment: boolean
) => {
  await tx
    .update(postAnalyticsTable)
    .set({
      [column]: sql`${postAnalyticsTable[column]} ${increment ? sql`+` : sql`-`} 1`
    })
    .where(eq(postAnalyticsTable.postId, postId));
};
const getLikes = async (postId: string) => {
    const likes =await  db.select().from(postAnalyticsTable).where(eq(postAnalyticsTable.postId,postId))
    return likes.length===0 ? null : likes[0]
}

export default {
    updatePostAnalytics,
    updatePostAnalyticsWithTx,
    getLikes
}
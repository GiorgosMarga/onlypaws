import { eq, sql } from "drizzle-orm"
import { db } from "../db"
import { postAnalyticsTable } from "../db/schema/postLikes"

const createPostAnalytics = async (postId: string) => {
    const postAnal = await db.insert(postAnalyticsTable).values({postId}).returning()
    return postAnal.length === 0 ? null : postAnal[0]
}

const deletePostAnalytics = async (postId: string) => {
    const postAnal = await db.delete(postAnalyticsTable).where(eq(postAnalyticsTable.postId,postId)).returning()
    return postAnal.length === 0 ? null : postAnal[0]
}

const addLike = async (postId: string) => {
    await db.update(postAnalyticsTable)
    .set({ likes: sql`${postAnalyticsTable.likes} + 1` }) 
    .where(eq(postAnalyticsTable.postId, postId));
}

const deleteLike = async (postId: string) => {
    await db.update(postAnalyticsTable)
    .set({ likes: sql`${postAnalyticsTable.likes} - 1` }) 
    .where(eq(postAnalyticsTable.postId, postId));
}

const getLikes = async (postId: string) => {
    const likes =await  db.select().from(postAnalyticsTable).where(eq(postAnalyticsTable.postId,postId))
    return likes.length===0 ? null : likes[0]
}

export default {
    createPostAnalytics,
    deletePostAnalytics,
    addLike,
    deleteLike,
    getLikes
}
import { db } from "../db"
import postAnalyticsService from "../services/postAnalytics"
import { postLikesTable } from "../db/schema/postLikes"
import { and, eq } from "drizzle-orm";

const likePost = async (userId: string, postId: string)  => {

    const res =  await db.transaction(async (tx) => {
    // 1. Insert the like
        const liked = await tx.insert(postLikesTable).values({
            userId,
            postId,
        }).onConflictDoNothing().returning();

        // 2. Increment analytics
        await postAnalyticsService.updatePostAnalyticsWithTx(tx,postId, "likes", true)
        return liked.length === 0 ? null : liked[0]
    });
    return res
    
}


const removeLikePost = async (userId: string, postId: string)  => {

    const res =  await db.transaction(async (tx) => {
    // 1. Insert the like
        const removedLike = await tx.delete(postLikesTable).where(and(eq(postLikesTable.postId,postId),eq(postLikesTable.userId,userId))).returning();

        // 2. Increment analytics
        await postAnalyticsService.updatePostAnalyticsWithTx(tx,postId, "likes", false)
        return removedLike
    });
    return res.length === 0 ? null : res[0]
}

export default {
    likePost,
    removeLikePost
}

import { db } from "../db"
import postAnalyticsService from "../services/postAnalytics"
import { postLikesTable } from "../db/schema/postLikes"
import { and, eq, sql } from "drizzle-orm";
import { postSelectionPrivateView, postSelectionPublic, postsView } from "../db/schema/posts";
import { postSavesTable } from "../db/schema/postSaves";

const likePost = async (userId: string, postId: string)  => {

    const res =  await db.transaction(async (tx) => {
    // 1. Insert the like
        const liked = await tx.insert(postLikesTable).values({
            userId,
            postId,
        }).onConflictDoNothing().returning();

        if(liked.length === 0 ){
            return null // post already liked
        }
        // 2. Increment analytics
        await postAnalyticsService.updatePostAnalyticsWithTx(tx,postId, "likes", true)
        return liked[0]
    });
    return res
    
}


const removeLikePost = async (userId: string, postId: string)  => {

    const res =  await db.transaction(async (tx) => {
    // 1. Insert the like
        const removedLike = await tx.delete(postLikesTable).where(and(eq(postLikesTable.postId,postId),eq(postLikesTable.userId,userId))).returning();
        if (removedLike.length === 0) {
            return []
        }
        // 2. Increment analytics
        await postAnalyticsService.updatePostAnalyticsWithTx(tx,postId, "likes", false)
        return removedLike
    });
    return res.length === 0 ? null : res[0]
}


const getLikedPosts = async (userId: string) => {
    const res = await db.select(
        postSelectionPrivateView
    ).from(postLikesTable).where(eq(postLikesTable.userId,userId))
    .leftJoin(postsView, eq(postsView.id, postLikesTable.postId))
    .leftJoin(postSavesTable, eq(postSavesTable.userId, userId))

    return res.map(post => ({
        ...post,
        isSaved: post.isSaved !== null
    }))
}
export default {
    likePost,
    removeLikePost,
    getLikedPosts
}

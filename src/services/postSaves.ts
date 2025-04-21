import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { postSavesTable } from "../db/schema/postSaves";
import postAnalyticsService from "./postAnalytics";
import { calculateOffset } from "../utils/calculateOffset";
import { get } from "http";
import { postLikesTable } from "../db/schema/postLikes";
import { userInfoTable } from "../db/schema/userInfo";
import { postAnalyticsTable } from "../db/schema/postAnalytics";
import { postSelectionPublic, postSelectionPublicView, postsTable, postsView } from "../db/schema/posts";

const savePost = async (postId: string, userId: string) => {
    console.log("Saving post", postId, userId)
    const res = await db.transaction(async (tx) => {    
        const res = await tx.insert(postSavesTable).values({ userId, postId }).onConflictDoNothing().returning();
        await postAnalyticsService.updatePostAnalyticsWithTx(tx, postId, "saves", true);
        return res;
    })
    return res.length === 0 ? null : res[0];
}

const removeSavePost = async (postId: string, userId: string) => {
    const res = await db.transaction(async (tx) => {    
        const res = await tx.delete(postSavesTable).where(and(eq(postSavesTable.userId,userId),eq(postSavesTable.postId,postId))).returning();
        await postAnalyticsService.updatePostAnalyticsWithTx(tx, postId, "saves", false);
        return res;
    })
    return res.length === 0 ? null : res[0];
}

const getSavedPosts = async (userId: string, page: number, limit: number) => {
    const offset = calculateOffset(page, limit);
    const savedPosts = await db
    .select(
        {
            ...postSelectionPublicView,
            isLiked: postSavesTable.postId
        }
    )
    .from(postsView)
    .innerJoin(postSavesTable,eq(postSavesTable.postId,postsView.id))
    .innerJoin(postLikesTable,and(eq(postLikesTable.postId, postsView.id),eq(postLikesTable.userId, userId)))
    .where(eq(postSavesTable.userId,userId))
    .offset(offset).limit(limit)
    
    return savedPosts.map((p: any) => ({
        ...p,
        isLiked: p.isLiked !== null,
    }))
}

export default {
    savePost,
    removeSavePost,
    getSavedPosts
}
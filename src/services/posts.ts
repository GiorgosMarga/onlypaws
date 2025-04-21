import {  and, eq } from "drizzle-orm"
import { db } from "../db"
import { postSelectionPublicView, postsTable, postsView } from "../db/schema/posts"
import { calculateOffset } from "../utils/calculateOffset"
import { Post, PostInsert } from "../models/post.model"
import postAnalyticsService from "./postAnalytics"
import { postAnalyticsTable } from "../db/schema/postAnalytics"
import { userInfoTable } from "../db/schema/userInfo"
import { postLikesTable } from "../db/schema/postLikes"
import { postSavesTable } from "../db/schema/postSaves"

const getPosts = async (page: number, limit: number, currentUserId: string | null) => {

    let posts;
   if(currentUserId){
        posts = await db
        .select({
            ...postSelectionPublicView,
            isLiked: postLikesTable.postId,
            isSaved: postSavesTable.postId
        })
        .from(postsView)
        .leftJoin(postLikesTable, and(eq(postLikesTable.postId, postsView.id), eq(postLikesTable.userId, currentUserId)))
        .leftJoin(postSavesTable, and(eq(postSavesTable.postId, postsView.id), eq(postSavesTable.userId, currentUserId)))
        .limit(limit)
        .offset(calculateOffset(page, limit))

    
   }else{
        posts = await db
        .select(postSelectionPublicView)
        .from(postsView)
        .limit(limit)
        .offset(calculateOffset(page, limit))
   }

    return posts.map((p: any) => ({
        ...p,
        isLiked: currentUserId ? p.isLiked !== null : false,
        isSaved: currentUserId ? p.isSaved !== null : false,
    }));
};


const getPost = async (postId: string) => {
    const posts = await db.select({likes: postAnalyticsTable.likes, postsTable}).from(postsTable).leftJoin(postAnalyticsTable,eq(postsTable.id, postAnalyticsTable.postId)).where(eq(postsTable.id,postId))
    return posts.length === 0 ? null : {...posts[0].postsTable, likes: posts[0].likes}
}

const insertPost = async (post: PostInsert) => {
    const res = await db.transaction(async (tx) => {    
        // 1. Insert the post
        const insertedPost = await tx.insert(postsTable).values(post).returning()
        await tx.insert(postAnalyticsTable).values({postId: insertedPost[0].id})
        return insertedPost

    })
    return res.length === 0 ? null : res[0]
}

const updatePost = async (post: Post) => {
    const updatedPost = await db.update(postsTable).set(post).where(eq(postsTable.id,post.id)).returning()
    return updatedPost.length === 0 ? null : updatedPost[0]
}

const deletePost = async (postId: string) => {
    const deletedPost = await db.delete(postsTable).where(eq(postsTable.id, postId)).returning()    
    return deletedPost.length === 0 ? null : deletedPost[0]
}

const getPostsForUser = async (userId: string) => { 
    const posts = await db.select({views: postAnalyticsTable.views, likes: postAnalyticsTable.likes,comments: postAnalyticsTable.comments ,postsTable}).from(postsTable).leftJoin(postAnalyticsTable,eq(postsTable.id, postAnalyticsTable.postId)).where(eq(postsTable.userId,userId)) 
    
    return posts.length === 0 ? [] : posts.map((p) => ({...p.postsTable,likes: p.likes??0, comments: p.comments??0, views: p.views??0}))
}
export default {
    deletePost,
    updatePost,
    insertPost,
    getPosts,
    getPost,
    getPostsForUser
}
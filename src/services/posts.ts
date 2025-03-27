import {  eq } from "drizzle-orm"
import { db } from "../db"
import { postsTable } from "../db/schema/posts"
import { calculateOffset } from "../utils/calculateOffset"
import { Post, PostInsert } from "../models/post.model"
import postAnalyticsService from "./postAnalytics"
import { postAnalyticsTable } from "../db/schema/postAnalytics"

const getPosts = async (page:number, limit:number) => {
    const posts = await db.select({likes: postAnalyticsTable.likes, postsTable})
                        .from(postsTable)
                        .leftJoin(postAnalyticsTable,eq(postsTable.id, postAnalyticsTable.postId))
                        .limit(limit).offset(calculateOffset(page,limit))
    return posts.map((p) => ({...p.postsTable,likes: p.likes}))
}


const getPost = async (postId: string) => {
    const posts = await db.select({likes: postAnalyticsTable.likes, postsTable}).from(postsTable).leftJoin(postAnalyticsTable,eq(postsTable.id, postAnalyticsTable.postId)).where(eq(postsTable.id,postId))
    return posts.length === 0 ? null : {...posts[0].postsTable, likes: posts[0].likes}
}

const insertPost = async (post: PostInsert) => {
    const insertedPost = await db.insert(postsTable).values(post).returning()
    const result = insertedPost.length === 0 ? null : insertedPost[0]
    if(result) {
        await postAnalyticsService.createPostAnalytics(result.id)
    }
    return result
}

const updatePost = async (post: Post) => {
    const updatedPost = await db.update(postsTable).set(post).where(eq(postsTable.id,post.id)).returning()
    return updatedPost.length === 0 ? null : updatedPost[0]
}

const deletePost = async (postId: string) => {
    const deletedPost = await db.delete(postsTable).where(eq(postsTable.id,postId)).returning()
    const result = deletedPost.length === 0 ? null : deletedPost[0]
    if(result) {
        await postAnalyticsService.deletePostAnalytics(result.id)
    }
    return result
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
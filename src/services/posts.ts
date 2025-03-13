import { and, eq } from "drizzle-orm"
import { db } from "../db"
import { postsTable } from "../db/schema/posts"
import { calculateOffset } from "../utils/calculateOffset"
import { Post, PostInsert } from "../models/post.model"

const getPosts = async (page:number, limit:number) => {
    const posts = await db.select().from(postsTable).limit(limit).offset(calculateOffset(page,limit))
    return posts
}


const getPost = async (postId: string) => {
    const posts = await db.select().from(postsTable).where(eq(postsTable.id,postId))
    return posts.length === 0 ? null : posts[0]
}

const insertPost = async (post: PostInsert) => {
    const insertedPost = await db.insert(postsTable).values(post).returning()
    return insertedPost.length === 0 ? null : insertedPost[0]
}

const updatePost = async (post: Post) => {
    const updatedPost = await db.update(postsTable).set(post).where(eq(postsTable.id,post.id)).returning()
    return updatedPost.length === 0 ? null : updatedPost[0]
}

const deletePost = async (postId: string) => {
    const deletedPost = await db.delete(postsTable).where(eq(postsTable.id,postId)).returning()
    return deletedPost.length === 0 ? null : deletedPost[0]
}

export default {
    deletePost,
    updatePost,
    insertPost,
    getPosts,
    getPost
}
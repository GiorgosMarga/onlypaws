import type {Comment, CommentInsert} from "../models/comments.model"
import {db} from "../db"
import { commentsTable } from "../db/schema/comments"
import { eq } from "drizzle-orm"

const insertComment = async (comment: CommentInsert) => {
    const result = await db.insert(commentsTable).values(comment).returning()
    return result[0] ?? null
}

const updateComment = async (comment: Comment) => {
    const result = await db.update(commentsTable).set(comment).returning()
    return result[0] ?? null
}

const deleteComment = async (commentId: string) => {
    const result = await db.delete(commentsTable).where(eq(commentsTable.id, commentId)).returning()
    return result[0] ?? null
}

const getComments = async (postId: string) => {
    const comments = await db.select().from(commentsTable).where(eq(commentsTable.postId, postId))
    return comments ?? null
}

const getComment = async (commentId: string) => {
    const comments = await db.select().from(commentsTable).where(eq(commentsTable.id, commentId))
    return comments[0] ?? null
}

export const commentService = {
    insertComment,
    updateComment,
    deleteComment,
    getComments,
    getComment
} 
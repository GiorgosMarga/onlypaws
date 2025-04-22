import type {Comment, CommentInsert} from "../models/comments.model"
import {db} from "../db"
import { commentsTable } from "../db/schema/comments"
import { eq, sql } from "drizzle-orm"
import { userInfoTable } from "../db/schema/userInfo"
import { calculateOffset } from "../utils/calculateOffset"

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

const getComments = async (postId: string, page: number, limit: number) => {
    const offset = calculateOffset(page, limit)
    const comments = await db
    .select({content: commentsTable.content, createdAt: commentsTable.createdAt, id: commentsTable.id, userId: commentsTable.userId, username: userInfoTable.name})
    .from(commentsTable)
    .where(eq(commentsTable.postId, postId))
    .innerJoin(userInfoTable, eq(userInfoTable.userId, commentsTable.userId))
    .offset(offset)
    .limit(limit)
    .orderBy(sql`${commentsTable.createdAt} DESC`)
    return comments
}

const getComment = async (commentId: string) => {
    const comment = await db
    .select({content: commentsTable.content, createdAt: commentsTable.createdAt, id: commentsTable.id, userId: commentsTable.userId, username: userInfoTable.name})
    .from(commentsTable)
    .where(eq(commentsTable.id, commentId))
    .innerJoin(userInfoTable, eq(userInfoTable.userId, commentsTable.userId))
    return comment[0] ?? null
}

export const commentService = {
    insertComment,
    updateComment,
    deleteComment,
    getComments,
    getComment
} 
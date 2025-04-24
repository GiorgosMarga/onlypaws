import type {Comment, CommentInsert} from "../models/comments.model"
import {db} from "../db"
import { commentsTable } from "../db/schema/comments"
import { and, eq, inArray, isNull, notExists, sql } from "drizzle-orm"
import { userInfoTable } from "../db/schema/userInfo"
import { calculateOffset } from "../utils/calculateOffset"
import postAnalyticsService from "./postAnalytics"

const insertComment = async (comment: CommentInsert) => {


    const result = await db.transaction(async (tx) => { 
        const insertedComment = tx.insert(commentsTable).values(comment).returning()
        await postAnalyticsService.updatePostAnalyticsWithTx(tx, comment.postId, "comments", true)
        return insertedComment
    })
    return result[0] ?? null
}

const updateComment = async (comment: Comment) => {
    const result = await db.update(commentsTable).set(comment).returning()
    return result[0] ?? null
}

const deleteComment = async (commentId: string, postId: string) => {
    const result = await db.transaction(async (tx) => { 
        const deletedComment = tx.delete(commentsTable).where(eq(commentsTable.id, commentId)).returning()
        await postAnalyticsService.updatePostAnalyticsWithTx(tx,postId, "comments", false)
        return deletedComment
    })
    return result[0] ?? null
}

const getComments = async (postId: string, page: number, limit: number) => {
    const commentFields = {
        content: commentsTable.content,
        createdAt: commentsTable.createdAt,
        id: commentsTable.id,
        userId: commentsTable.userId,
        username: userInfoTable.name,
        parentId: commentsTable.parentId,
    }
    const offset = calculateOffset(page, limit)
    const comments = await db
    .select(commentFields)
    .from(commentsTable)
    .where(and(eq(commentsTable.postId, postId),isNull(commentsTable.parentId)))
    .innerJoin(userInfoTable, eq(userInfoTable.userId, commentsTable.userId))
    .offset(offset)
    .limit(limit)
    .orderBy(sql`${commentsTable.createdAt} DESC`)

    const parentIds = comments.map((comment) => comment.id)

    const replies = await db.select({...commentFields, mainCommentId: commentsTable.mainCommentId}).from(commentsTable).where(inArray(commentsTable.mainCommentId, parentIds)).innerJoin(userInfoTable, eq(userInfoTable.userId, commentsTable.userId)).orderBy(sql`${commentsTable.createdAt} ASC`);

    const replyMap = new Map<string, any>();

    for(let reply of replies) {
        replyMap.set(reply.id, reply);
    }

    const repliesByParent: Record<string, any> = {};
    for (let reply of replies) {
        const replyTo = replyMap.get(reply.parentId ?? "");
        const replyToUsername = replyTo ? replyTo.username : null; 
        if (!repliesByParent[reply.mainCommentId!]) {
            repliesByParent[reply.mainCommentId!] = [];
        }
        if (repliesByParent[reply.mainCommentId!].length < 10) {
            repliesByParent[reply.mainCommentId!].push({...reply,replyToUsername});
        }
    }

    const commentsWithReplies = comments.map(comment => ({
        ...comment,
        replies: repliesByParent[comment.id] || [],
    }));

    return commentsWithReplies
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
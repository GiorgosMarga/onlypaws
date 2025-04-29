import { and, eq, or, sql } from "drizzle-orm"
import { db } from "../db"
import { conversationsTable } from "../db/schema/conversations"
import { userInfoTable } from "../db/schema/userInfo"
import { alias } from "drizzle-orm/pg-core"
import { messagesTable } from "../db/schema/messages"
import { calculateOffset } from "../utils/calculateOffset"

const createConversation = async (user1:string, user2:string) => {
    const newConv = await db
    .insert(conversationsTable)
    .values({user1,user2})
    .returning({id: conversationsTable.id})

    return newConv.length > 0 ? newConv[0].id : null
}
const user1Table = alias(userInfoTable, "user1_info")
const user2Table = alias(userInfoTable, "user2_info")
const getAllConversations = async (userId: string) => {
    const conversations = await db
    .selectDistinctOn([conversationsTable.id], {
        id: conversationsTable.id,
        user1: conversationsTable.user1,
        user2: conversationsTable.user2,
        user1Details: {
            id: user1Table.userId,
            userAvatar: user1Table.userAvatar,
            name: user1Table.name,
        },
        user2Details: {
            id: user2Table.userId,
            userAvatar: user2Table.userAvatar,
            name: user2Table.name,
        },
        lastMessage: {
            id: messagesTable.id,
            content: messagesTable.content,
            createdAt: messagesTable.createdAt,
            from: messagesTable.from,
            to: messagesTable.to,
        },
    })
    .from(conversationsTable)
    .leftJoin(user1Table, eq(conversationsTable.user1, user1Table.userId))
    .leftJoin(user2Table, eq(conversationsTable.user2, user2Table.userId))
    .leftJoin(
        messagesTable,
        and(
        eq(messagesTable.conversationId, conversationsTable.id),
        eq(
            messagesTable.id,
            db
            .select({ id: messagesTable.id })
            .from(messagesTable)
            .where(eq(messagesTable.conversationId, conversationsTable.id))
            .orderBy(sql`created_at DESC`)
            .limit(1)
        )
        )
    )
    .where(
        or(eq(conversationsTable.user1, userId), eq(conversationsTable.user2, userId))
    );

    return conversations.map((conv) => {
        // const chatMessages = messages.filter((m) => m.conversationId === conv.id) 
        if(conv.user1Details?.id === userId) {
            return {id:conv.id,user: conv.user2Details, lastMessage: conv.lastMessage?.content }
        }else{
            return {id:conv.id,user: conv.user1Details, lastMessage: conv.lastMessage?.content}
        }
    })
}

const conversationExists = async (from: string, to: string) => {
    const conversation = await db
    .select({
        id: conversationsTable.id,
    })
    .from(conversationsTable)
    .where(
        or(
            and(eq(conversationsTable.user1,from),eq(conversationsTable.user2, to)),
            and(eq(conversationsTable.user1,to),eq(conversationsTable.user2, from)),
        )
    )

    return conversation.length > 0 ? conversation[0].id : null
}

const getConversationMessages = async (userId:string, conversationId: string, limit: number, page:number) => {
    const offset = calculateOffset(page,limit)
    const res = await db
    .select({
        id: messagesTable.id,
        content: messagesTable.content,
        from: messagesTable.from,
        to: messagesTable.to,
        conversationId: messagesTable.conversationId,
        createdAt: messagesTable.createdAt,
        readAt: messagesTable.readAt
    })
    .from(conversationsTable)
    .where(
        and(
            eq(conversationsTable.id, conversationId),
            or(eq(conversationsTable.user1,userId),eq(conversationsTable.user2,userId))
        )
    )
    .leftJoin(messagesTable, eq(messagesTable.conversationId, conversationsTable.id))
    .orderBy(sql`created_at DESC`)
    .offset(offset)
    .limit(limit)


    return res.reverse()
}

export default {
    createConversation,
    getAllConversations,
    conversationExists,
    getConversationMessages
}
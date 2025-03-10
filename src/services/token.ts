import { and, eq, gt } from "drizzle-orm"
import { db } from "../db"
import { refreshTokenTable } from "../db/schema/refreshTokens"
import {type RefreshToken} from "../models/refreshToken.model"

export const insertRefreshToken = async (refreshToken: RefreshToken) => {
    try{
        const token = await db.insert(refreshTokenTable).values(refreshToken).returning()
        return token.length === 0 ? null : token[0]
    }catch(e){
        return null
    }
}


export const deleteRefreshToken = async (refreshTokenId: string, userId: string) => {
    try{
        const token = await db.delete(refreshTokenTable).where(and(eq(refreshTokenTable.id, refreshTokenId),eq(refreshTokenTable.userId,userId), gt(refreshTokenTable.expiresAt, new Date()), eq(refreshTokenTable.isRevoked,false))).returning()
        return token.length === 0 ? null : token[0]
    }catch(e){
        return null
    }
}

export const revokeToken = async (tokenId: string) => {
    const token = await db.update(refreshTokenTable).set({isRevoked: true}).where(eq(refreshTokenTable.id,tokenId)).returning()
    return token.length === 0 ? null : token[0]
}
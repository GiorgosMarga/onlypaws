import { and, eq, gt } from "drizzle-orm"
import { db } from "../db"
import { refreshTokenTable } from "../db/schema/refreshTokens"
import {type RefreshTokenInsert} from "../models/refreshToken.model"
import { type User } from "../models/user.model"
import convertToMs from "../utils/convertToMs"
import { signToken } from "../utils/token"

const insertRefreshToken = async (refreshToken: RefreshTokenInsert) => {
    const token = await db.insert(refreshTokenTable).values(refreshToken).returning()
    return token.length === 0 ? null : token[0]
}

const deleteRefreshToken = async (refreshTokenId: string, userId: string) => {
    
    const token = await db.delete(refreshTokenTable).where(and(eq(refreshTokenTable.id, refreshTokenId),eq(refreshTokenTable.userId,userId), gt(refreshTokenTable.expiresAt, new Date()), eq(refreshTokenTable.isRevoked,false))).returning()
    return token.length === 0 ? null : token[0]
   
}

const revokeTokenForUser = async (userId: string) => {
    const token = await db.update(refreshTokenTable).set({isRevoked: true}).where(eq(refreshTokenTable.userId,userId)).returning()
    return token.length === 0 ? null : token[0]
}
const revokeToken = async (tokenId: string) => {
    const token = await db.update(refreshTokenTable).set({isRevoked: true}).where(eq(refreshTokenTable.userId,tokenId)).returning()
    return token.length === 0 ? null : token[0]
}
const createTokens = async (user: User) => {
    const refreshTokenExpirationDate = new Date(Date.now() + convertToMs(7,"d")) // <- 7 days
    const accessToken = signToken({user}, process.env.JWT_ACCESS_SECRET!, {expiresIn: "1h"})
    const refreshToken = await insertRefreshToken({userId: user.id,expiresAt: refreshTokenExpirationDate})
    const signedRefreshToken = signToken({refreshToken}, process.env.JWT_REFRESH_SECRET!, {expiresIn: "7d"})    
    return [accessToken,signedRefreshToken]
}

export default {
    createTokens,
    revokeTokenForUser,
    deleteRefreshToken,
    revokeToken,
    insertRefreshToken
}
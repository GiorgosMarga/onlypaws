import { randomUUID } from "crypto"
import { db } from "../db"
import { refreshTokenTable } from "../db/schema/refreshToken"
import {type RefreshToken} from "../models/refreshToken.model"

export const insertRefreshToken = async (refreshToken: RefreshToken) => {
    try{
        const token = await db.insert(refreshTokenTable).values(refreshToken).returning()
        return token.length === 0 ? null : token[0]
    }catch(e){
        return null
    }
}


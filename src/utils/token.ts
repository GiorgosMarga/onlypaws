import { randomUUID } from "crypto"
import jwt, { JwtPayload } from "jsonwebtoken"
import { RefreshToken } from "../models/refreshToken.model"
import type { Request } from "express"
import { User } from "../models/user.model"

export const generateRefreshToken = (userId: string, expiresAt: Date) => {
    return {
        id: randomUUID() as string,
        userId,
        expiresAt
    } as RefreshToken
}

export const signToken = (payload: any, secret: string, options?: jwt.SignOptions) => {
    return jwt.sign(payload, secret, options);
}


export type TokenUser = {
        id: string,
        isBanned: boolean,
        isVerified: boolean,
        role: "ADMIN" | "USER"
    }



export interface AccessTokenJWT extends JwtPayload {
    user: TokenUser 
}
export interface RefreshTokenJWT extends JwtPayload {
    refreshToken: RefreshToken
}

export const validateToken = <T extends JwtPayload>(token: string, secret: string): T | null => {
    try{
        return jwt.verify(token,secret) as T
    }catch(err){
        return null
    }
}

export const getRefreshToken = (req: Request): RefreshToken | null => {
    const token = req.cookies["refresh_token"]
    const payload = validateToken<RefreshTokenJWT>(token, process.env.JWT_REFRESH_SECRET!)
    if(!payload){
        return null
    }
    const { refreshToken } = payload
    return refreshToken
}
import { randomUUID } from "crypto"
import "dotenv/config"
import jwt, { JwtPayload } from "jsonwebtoken"
import { RefreshToken } from "../models/refreshToken.model"


export const generateRefreshToken = (userId: string, expiresAt: Date) => {
    return {
        id: randomUUID() as string,
        userId,
        expiresAt
    } as RefreshToken
}


// TODO: add fields in jwt
export const signToken = (payload: any, secret: string, options?: jwt.SignOptions) => {
    return jwt.sign({payload}, secret, options);
}


export const validateToken = (token: string, secret: string) => {
    try{
        const payload = jwt.verify(token,secret)
        return payload as JwtPayload
    }catch(err){
        return null
    }
}

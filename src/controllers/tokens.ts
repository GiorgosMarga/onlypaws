import "dotenv/config"
import { Request, Response } from "express";
import BadRequestError from "../errors/BadRequestError";
import { validateToken } from "../utils/token";
import { db } from "../db";
import { and, count, eq, gt, lt } from "drizzle-orm";
import { refreshTokenTable } from "../db/schema/refreshToken";
import { StatusCodes } from "http-status-codes";
import NotAuthorizedError from "../errors/NotAuthorizedError";
import { fetchUserByEmail, fetchUserById } from "../services/user";

export const refreshToken = async (req: Request, res: Response) => {
    

    const refreshT = req.cookies["refresh_token"]

    if(!refreshT) {
        throw new NotAuthorizedError({message: "You are not authorized to perform this action."})
    }

    const tokenPayload = validateToken(refreshT, process.env.JWT_REFRESH_SECRET!)
    if(!tokenPayload) {
        throw new NotAuthorizedError({message: "You are not authorized to perform this action."})
    }
    const {payload: refreshToken} = tokenPayload
    // delete old refresh token and issue a new one together with an access token
    const isValid = await db.delete(refreshTokenTable).where(and(eq(refreshTokenTable.id, refreshToken.id),eq(refreshTokenTable.userId, refreshToken.userId), lt(refreshTokenTable.expiresAt, new Date()))).returning()

    if (isValid.length === 0 ){
        throw new NotAuthorizedError({message: "You are not authorized to perform this action."})
    }

    const user = await fetchUserById(refreshToken.userId)
    if(!user) {
        throw new NotAuthorizedError({message: "You are not authorized to perform this action."})
    }




 
    res.status(StatusCodes.OK).json({refreshToken})
}
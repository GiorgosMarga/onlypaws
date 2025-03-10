import "dotenv/config"
import { Request, Response } from "express";
import { generateRefreshToken, getRefreshToken, signToken, validateToken } from "../utils/token";
import { StatusCodes } from "http-status-codes";
import NotAuthorizedError from "../errors/NotAuthorizedError";
import { fetchUserById } from "../services/user";
import { deleteRefreshToken, insertRefreshToken } from "../services/token";
import { uuidSchema } from "../validators/uuid";
import BadRequestError from "../errors/BadRequestError";
import { revokeToken as revokeTokenService } from "../services/token";
import NotFoundError from "../errors/NotFoundError";
import convertToMs from "../utils/convertToMs";

export const refreshToken = async (req: Request, res: Response) => {
    
    const tokenPayload = getRefreshToken(req)

    if(!tokenPayload) {
        throw new BadRequestError({message: "Missing token"})
    }

    // delete old refresh token and issue a new one together with an access token
    const isValid = await deleteRefreshToken(tokenPayload.id, tokenPayload.userId)

    if (!isValid){
        throw new NotAuthorizedError({message: "You are not authorized to perform this action."})
    }

    
    const user = await fetchUserById(tokenPayload.userId)
    if(!user) {
        throw new NotAuthorizedError({message: "You are not authorized to perform this action."})
    }


    const newRefreshToken = generateRefreshToken(user.id, new Date(Date.now() + convertToMs(7,"d")))
    
    const insertedToken = await insertRefreshToken(newRefreshToken)
    console.log(insertedToken)
    const accessToken = signToken({user},process.env.JWT_ACCESS_SECRET!,{expiresIn: "1h"})
    const signedRefreshToken = signToken({refreshToken: newRefreshToken},process.env.JWT_REFRESH_SECRET!,{expiresIn: "7d"})

    res.cookie('access_token',accessToken, { maxAge: convertToMs(1,"h") , httpOnly: true }); // <- 1 h
    res.cookie('refresh_token',signedRefreshToken, { maxAge: convertToMs(7,"d"), httpOnly: true });

    res.status(StatusCodes.OK).json({newRefreshToken,signedRefreshToken})
}

export const revokeToken = async (req: Request, res: Response) => {
    const {id} = req.params

    const {error: validationError} = uuidSchema.validate(req.params)
    if (validationError) {
        throw new BadRequestError({message: "Invalid id form"})
    }

    const revokedToken = await revokeTokenService(id)
    if(!revokedToken) {
        throw new NotFoundError({message: `Token with id: ${id} was not found`})
    }

    res.status(StatusCodes.OK).json({message: "Success"})
}
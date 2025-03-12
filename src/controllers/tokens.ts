import "dotenv/config"
import { Request, Response } from "express";
import { getRefreshToken } from "../utils/token";
import { StatusCodes } from "http-status-codes";
import NotAuthorizedError from "../errors/NotAuthorizedError";
import userService from "../services/user";
import tokenService from "../services/token";
import { uuidSchema } from "../validators/uuid";
import BadRequestError from "../errors/BadRequestError";
import NotFoundError from "../errors/NotFoundError";
import convertToMs from "../utils/convertToMs";

export const refreshToken = async (req: Request, res: Response) => {
    
    const tokenPayload = getRefreshToken(req)

    if(!tokenPayload) {
        throw new BadRequestError({message: "Missing token"})
    }

    // delete old refresh token and issue a new one together with an access token
    const isValid = await tokenService.deleteRefreshToken(tokenPayload.id, tokenPayload.userId)

    if (!isValid){
        throw new NotAuthorizedError({message: "You are not authorized to perform this action. (tr)"})
    }

    
    const user = await userService.fetchUserById(tokenPayload.userId)
    if(!user || !user.users) {
        throw new NotAuthorizedError({message: "You are not authorized to perform this action."})
    }

    const [accessToken, refreshToken] = await tokenService.createTokens(user.users)

    res.cookie('access_token',accessToken, { maxAge: convertToMs(1,"h") , httpOnly: true }); // <- 1 h
    res.cookie('refresh_token',refreshToken, { maxAge: convertToMs(7,"d"), httpOnly: true });

    res.status(StatusCodes.OK).json({accessToken,refreshToken})
}

export const revokeToken = async (req: Request, res: Response) => {
    const {id} = req.params

    const {error: validationError} = uuidSchema.validate(req.params)
    if (validationError) {
        throw new BadRequestError({message: "Invalid id form"})
    }

    const revokedToken = await tokenService.revokeToken(id)
    if(!revokedToken) {
        throw new NotFoundError({message: `Token with id: ${id} was not found`})
    }

    res.status(StatusCodes.OK).json({message: "Success"})
}
export const revokeTokenForUser = async (req: Request, res: Response) => {
    const {id} = req.params

    const {error: validationError} = uuidSchema.validate(req.params)
    if (validationError) {
        throw new BadRequestError({message: "Invalid id form"})
    }

    const revokedToken = await tokenService.revokeTokenForUser(id)
    if(!revokedToken) {
        throw new NotFoundError({message: `User with id: ${id} was not found`})
    }

    res.status(StatusCodes.OK).json({message: "Success"})
}
import "dotenv/config"
import { NextFunction, Request, Response } from "express";
import { AccessTokenJWT, validateToken } from "../utils/token";
import NotAuthorizedError from "../errors/NotAuthorizedError";
import { AuthenticatedReq } from "./authorize";

export default function authenticate(
    req: AuthenticatedReq,
    res: Response,
    next: NextFunction 
){

    let {access_token: token} = req.cookies
    
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if(!token || token.length === 0) {
        throw new NotAuthorizedError({message:"You are not authenticated"})
    }

    const tokenPayload = validateToken<AccessTokenJWT>(token, process.env.JWT_ACCESS_SECRET!)
    if(!tokenPayload) {
        throw new NotAuthorizedError({message:"You are not authenticated"})
    }
    req.user = tokenPayload.user 
    next()
}
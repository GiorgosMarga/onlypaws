import "dotenv/config"
import { NextFunction, Request, Response } from "express";
import { AccessTokenJWT, validateToken } from "../utils/token";
import NotAuthorizedError from "../errors/NotAuthorizedError";

export default function authenticate(
    req: Request,
    res: Response,
    next: NextFunction 
){
    const auth_header = req.headers["authorization"]
    if(!auth_header || auth_header.length === 0) {
        throw new NotAuthorizedError({message:"You are not authenticated"})
    }
    
    const token = auth_header.split(" ")[1]
    if(!token || token.length === 0){
        throw new NotAuthorizedError({message:"You are not authenticated"})
    }

    const tokenPayload = validateToken<AccessTokenJWT>(token, process.env.JWT_ACCESS_SECRET!)
    if(!tokenPayload) {
        throw new NotAuthorizedError({message:"You are not authenticated"})
    }
    const { user } = tokenPayload
    req["user"] = user 
    next()
}
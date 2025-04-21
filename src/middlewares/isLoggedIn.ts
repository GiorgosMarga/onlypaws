import "dotenv/config"
import { NextFunction, Request, Response } from "express";
import { AccessTokenJWT, validateToken } from "../utils/token";
import NotAuthorizedError from "../errors/NotAuthorizedError";
import { AuthenticatedReq } from "./authorize";


// this middleware is used to check if the user is logged in
// its used before getPosts controller, if the user is not logged in the controller will still be called
export default function isLoggedIn(
    req: AuthenticatedReq,
    res: Response,
    next: NextFunction 
){

    let {access_token: token} = req.cookies
    
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if(!token || token.length === 0) {
        next()
        return
    }

    const tokenPayload = validateToken<AccessTokenJWT>(token, process.env.JWT_ACCESS_SECRET!)
    if(!tokenPayload) {
        next()
        return
    }
    req.user = tokenPayload?.user 
    next()
    return
}
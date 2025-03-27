import { NextFunction, Request, Response } from "express";
import NotAuthorizedError from "../errors/NotAuthorizedError";
import { TokenUser } from "../utils/token";

export interface AuthenticatedReq extends Request {
    user?: TokenUser
}


// authorize middleware is called only after authenticate middleware
export default function authorize(req: AuthenticatedReq, res: Response, next: NextFunction) {
    const {user} = req
    if(!user) {
        throw new NotAuthorizedError({message: "You are not authorized."})
    }

    if(user.role != "ADMIN") {
        throw new NotAuthorizedError({message: "You are not authorized"})
    }

    next()
} 
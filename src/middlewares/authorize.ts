import { NextFunction, Request, Response } from "express";
import NotAuthorizedError from "../errors/NotAuthorizedError";
import { User } from "../models/user.model";

export interface AuthenticatedReq extends Request {
    user?: User
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
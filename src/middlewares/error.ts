import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../errors/ApiError";

export default function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
){
    if(err instanceof ApiError){
        if(err.statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
            console.log(err.message)
        }
        res.status(err.statusCode).json({
            error: {
                message: err.statusCode === StatusCodes.INTERNAL_SERVER_ERROR ? "internal server error":err.message,
            }
        })
        return
    }

    console.log(err)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: {
            message: "internal server error",
        }
    })
    next()
}
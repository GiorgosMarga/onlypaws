import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export default function notFound(req: Request, res: Response) {
    res.status(StatusCodes.NOT_FOUND).json({message: "end point doesnt exist"})
}
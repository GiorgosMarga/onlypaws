import { StatusCodes } from "http-status-codes";
import errors from "../errors";
import { AuthenticatedReq } from "../middlewares/authorize";
import { uuidSchema } from "../validators/uuid";
import { type Response } from "express";
import postSavesService from "../services/postSaves"

const savePost = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!
    const postId = req.params["postId"] as string

    const {error: idError} = uuidSchema.validate(postId)
    if(idError) {
        throw new errors.BadRequestError({message: `Invalid id: ${postId}`})
    }
    const result = await postSavesService.savePost(postId,user.id)
    if(!result) {
        throw new errors.InternalServerError({message: "Internal Server Error"})
    }
    res.status(StatusCodes.CREATED).json({message: "Success"})
}

const removeSavePost = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!
    const postId = req.params["postId"] as string

    const {error: idError} = uuidSchema.validate(postId)
    if(idError) {
        throw new errors.BadRequestError({message: `Invalid id: ${postId}`})
    }

    const result = await postSavesService.removeSavePost(user.id,postId)
    if(!result) {
        throw new errors.InternalServerError({message: "Internal Server Error"})
    }
    res.status(StatusCodes.OK).json({message: "Success"})
}

const getSavedPosts = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!
    let page = Number(req.query["page"])
    let limit = Number(req.query["limit"])
    if(!page || isNaN(page)) {
        page = 1
    }
    if(!limit || isNaN(limit)) {
        limit = 10
    }

    const savedPosts = await postSavesService.getSavedPosts(user.id, page, limit)

    res.status(StatusCodes.OK).json({savedPosts})
    
}

export default {
    savePost,
    removeSavePost,
    getSavedPosts
}
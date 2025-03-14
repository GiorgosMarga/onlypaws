import errors from "../errors";
import { AuthenticatedReq } from "../middlewares/authorize";
import { uuidSchema } from "../validators/uuid";
import postLikesService from "../services/postLikes"
import { StatusCodes } from "http-status-codes";
import { Response } from "express";

const likePost = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!
    const postId = req.params["postId"] as string

    const {error: idError} = uuidSchema.validate(postId)
    if(idError) {
        throw new errors.BadRequestError({message: `Invalid id: ${postId}`})
    }

    const err = await postLikesService.likePost(user.id,postId)
    if(err) {
        throw new errors.InternalServerError({message: "Could not like post"})
    }
    res.status(StatusCodes.OK).json({message: "Success"})
}

const removeLikePost = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!
    const postId = req.params["postId"] as string

    const {error: idError} = uuidSchema.validate(postId)
    if(idError) {
        throw new errors.BadRequestError({message: `Invalid id: ${postId}`})
    }

    const err = await postLikesService.removeLikePost(user.id,postId)
    if(err) {
        throw new errors.InternalServerError({message: "Could not like post"})
    }
    res.status(StatusCodes.OK).json({message: "Success"})
}


export default {
    likePost,
    removeLikePost
}
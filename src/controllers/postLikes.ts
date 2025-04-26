import errors from "../errors";
import { AuthenticatedReq } from "../middlewares/authorize";
import { uuidSchema } from "../validators/uuid";
import postLikesService from "../services/postLikes"
import { StatusCodes } from "http-status-codes";
import { Response } from "express";
import postAnalyticsService from "../services/postAnalytics"


const likePost = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!
    const postId = req.params["postId"] as string

    const {error: idError} = uuidSchema.validate(postId)
    if(idError) {
        throw new errors.BadRequestError({message: `Invalid id: ${postId}`})
    }

    const result = await postLikesService.likePost(user.id,postId)
    if(!result) {
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

    const result = await postLikesService.removeLikePost(user.id,postId)
    if(!result) {
        throw new errors.InternalServerError({message: "Could not remove like from post"})
    }
    res.status(StatusCodes.OK).json({message: "Success"})
}

const getLikedPosts = async (req: AuthenticatedReq, res: Response) => {

    const user = req.user!

    const posts = await postLikesService.getLikedPosts(user.id)
    res.status(StatusCodes.OK).json({posts})

}
   
export default {
    likePost,
    removeLikePost,
    getLikedPosts
}
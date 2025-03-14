import { Request, Response } from "express";
import postsService from "../services/posts"
import { StatusCodes } from "http-status-codes";
import { uuidSchema } from "../validators/uuid";
import type {AuthenticatedReq} from "../middlewares/authorize"
import postsValidator from "../validators/post"
import parseJoiErrors from "../utils/parseJoiErrors";
import Errors from "../errors"

const updatePost = async (req: AuthenticatedReq, res: Response) => {
    const postId = req.params["postId"] as string
    const {error: idError} = uuidSchema.validate(postId)

    if(idError) {
        throw new Errors.BadRequestError({message: `Invalid id: ${postId}`})
    }

    const user = req.user!

    const post = await postsService.getPost(postId)
    if(!post) {
        throw new Errors.NotFoundError({message: `Post with id: ${postId} doesnt exits`})
    }


    if(user.id !== post.id && user.role !== 'ADMIN') {
        throw new Errors.NotAuthorizedError({message: "You are not authorized to perform this action"})
    }

    const {error: validationError} = postsValidator.updatePostSchema.validate(req.body)
    
    if(validationError){
        throw new Errors.BadRequestError({message: validationError.details[0].message})
    }

    const updatedPost  = await postsService.updatePost({...req.body, id:postId})
    if(!updatedPost) {
        throw new Errors.InternalServerError({message: "Could not insert post"})
    }

    res.status(StatusCodes.OK).json({post: updatedPost})

}


const getPosts = async (req: Request, res: Response) => {
    let page = Number(req.query["page"])
    if(!page || isNaN(page)) {
        page = 1
    }

    let limit = Number(req.query["limit"])
    if(!limit || isNaN(limit)) {
        limit = 10
    }

    const posts = await postsService.getPosts(page,limit)

    res.status(StatusCodes.OK).json({posts})
}

const getPost = async (req: Request, res: Response) => {
    const postId = req.params["postId"] as string

    const {error: validationError} = uuidSchema.validate(postId)
    if(validationError) {
        throw new  Errors.BadRequestError({message: "Invalid id: "+postId})
    }

    const post = await postsService.getPost(postId)
    if(!post) {
        throw new  Errors.NotFoundError({message: `Post with id: ${postId} doesn't exist.`})
    }

    res.status(StatusCodes.OK).json({post})
}

const createPost = async (req: AuthenticatedReq, res: Response) => {
    const {error: validationError} = postsValidator.createPostSchema.validate(req.body)
    if(validationError) {
        throw new Errors.BadRequestError({message: parseJoiErrors(validationError)})
    }
    const user = req.user!
    const post = await postsService.insertPost({...req.body, userId:user.id})
    if(!post) {
        throw new Errors.InternalServerError({message: "Could not insert post."+ req.body})
    }
    res.status(StatusCodes.OK).json({post})
}


const deletePost = async (req: AuthenticatedReq, res: Response) => {
    const postId = req.params["postId"] as string
    const {error: idError} = uuidSchema.validate(postId)
    if(idError) {
        throw new Errors.BadRequestError({message: "Invalid id: "+postId})
    }
    const {error: validationError} = postsValidator.createPostSchema.validate(req.body)
    if(validationError) {
        throw new Errors.BadRequestError({message: parseJoiErrors(validationError)})
    }
    const user = req.user!
    const fetchedPost = await postsService.getPost(postId)
    if(!fetchedPost) {
        throw new Errors.NotFoundError({message: `Post with id: ${postId} doesn't exist.`})
    }

    if(fetchedPost.userId !== user.id && user.role !== "ADMIN") {
        throw new Errors.NotAuthorizedError({message: "You are not authorized to perform this action."})
    }

    const post = await postsService.deletePost(postId)
    if(!post) {
        throw new Errors.InternalServerError({message: "Error deleting post."})
    }
    res.status(StatusCodes.OK).json({post})
}

export default {
    deletePost,
    createPost,
    getPost,
    getPosts,
    updatePost
}
import { Request, Response } from "express";
import postsService from "../services/posts"
import { StatusCodes } from "http-status-codes";
import { uuidSchema } from "../validators/uuid";
import type {AuthenticatedReq} from "../middlewares/authorize"
import postsValidator from "../validators/post"
import parseJoiErrors from "../utils/parseJoiErrors";
import Errors from "../errors"
import "dotenv/config"
import errors from "../errors";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../s3Bucket";
import { randomUUID } from "crypto";
import {redisClient} from "../redisClient"  

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


const getPosts = async (req: AuthenticatedReq, res: Response) => {


    const user = req.user

    let page = Number(req.query["page"])
    if(!page || isNaN(page)) {
        page = 1
    }

    let limit = Number(req.query["limit"])
    if(!limit || isNaN(limit)) {
        limit = 10
    }

    const cachedPosts = await redisClient.get(`posts`)
    if(cachedPosts) {
        console.log("Cache hit")
        return res.status(StatusCodes.OK).json({posts: JSON.parse(cachedPosts)})
    }

    const posts = await postsService.getPosts(page,limit, user ? user.id : null)
    await redisClient.setEx(`posts`, 10, JSON.stringify(posts))

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
    const postJSON = JSON.parse(req.body.post)
    const {error: validationError} = postsValidator.createPostSchema.validate(postJSON)
    if(validationError) {
        throw new Errors.BadRequestError({message: parseJoiErrors(validationError)})
    }

    if(!req.file){
        throw new errors.BadRequestError({message: "Error reading content"})
    }
    const user = req.user!

    const postS3Key = randomUUID()
    const params = {
        Bucket: process.env.BUCKET_NAME!,
        Key: postS3Key,
        Body: req.file?.buffer,
        ContentType: req.file?.mimetype
    }

    const command = new PutObjectCommand(params)
    console.time('uploading')
    
    const s3Result = await s3Client.send(command)
    
    console.timeEnd('uploading')

    if(!s3Result) {
        throw new errors.InternalServerError({message: "Error uploading file to S3"})
    }
    const postUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${postS3Key}`
    postJSON.mediaUrl = [postUrl]
    const post = await postsService.insertPost({...postJSON, userId:user.id})
    if(!post) {
        throw new Errors.InternalServerError({message: "Could not insert post."+ req.body})
    }

    res.status(StatusCodes.CREATED).json({post})
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


const getPostsForUser = async (req: Request, res: Response) => {
    const {userId} = req.params
    const {error: idError} = uuidSchema.validate(userId)
    if(idError) {   
        throw new Errors.BadRequestError({message: "Invalid id: "+userId})
    }   

    const posts = await postsService.getPostsForUser(userId)  
    res.status(StatusCodes.OK).json({posts})    

}
export default {
    deletePost,
    createPost,
    getPost,
    getPosts,
    updatePost,
    getPostsForUser
}
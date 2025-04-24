import type { Request, Response } from "express";
import {uuidSchema} from "../validators/uuid"
import errors from "../errors"
import { commentService } from "../services/comments";
import { StatusCodes } from "http-status-codes";
import { AuthenticatedReq } from "../middlewares/authorize";
import { commentsValidator } from "../validators/comments";
import ParseValidationErrors from "../utils/parseValidationError";
import post from "../validators/post";

const getComments = async (req: Request, res: Response) => {
    const postId  = req.params["postId"] as string
    const {error: validationError} = uuidSchema.validate(postId)
    if(validationError) {
        throw new errors.BadRequestError({message: `Invalid id: ${postId}`})
    }

    let page = Number(req.query["page"])
    let limit = Number(req.query["limit"])
    if(!page || isNaN(page)) {
        page = 1
    }
    if(!limit || isNaN(limit)) {
        limit = 10
    }

    const comments = await commentService.getComments(postId,page,limit)
    res.status(StatusCodes.OK).json({comments})
}

const createComment = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!
    const {error: validationError} = commentsValidator.createComment.validate(req.body)
    if(validationError) {
        throw new errors.BadRequestError({message: ParseValidationErrors(validationError)})
    }

    const comment = await commentService.insertComment({...req.body, userId: user.id})
    if(!comment) {
        throw new errors.InternalServerError({message: "Error creating comment."})
    }

    res.status(StatusCodes.CREATED).json({comment: {
        ...comment,
        usename: "you",
        likes: 0
    }})
}
const deleteComment = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!
    const commentId = req.params["commentId"]
    const {error: validationError} = uuidSchema.validate(commentId)
    if(validationError) {
        throw new errors.BadRequestError({message: `Invalid id: ${commentId}`})
    }

    const comment = await commentService.getComment(commentId)
    if(!comment) {
        throw new errors.NotFoundError({message:`Comment with id: ${commentId} was not found`})
    }

    if(comment.userId !== user.id && user.role !== "ADMIN") {
        throw new errors.NotAuthorizedError({message: "You are not authorized to perform this action"})
    }

    const result = await commentService.deleteComment(commentId, comment.id)
    if(!result) {
        throw new errors.InternalServerError({message: `Could not delete comment with id: ${commentId}`})
    }

    res.status(StatusCodes.OK).json({comment})
}

const updateComment = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!
    const commentId = req.params["commentId"]
    const {error: idError} = uuidSchema.validate(commentId)
    if(idError) {
        throw new errors.BadRequestError({message: `Invalid id: ${commentId}`})
    }
    const {error: validationError} = commentsValidator.updateComment.validate(req.body)
    if(validationError) {
        throw new errors.BadRequestError({message: validationError.details[0].message})
    }

    const comment = await commentService.getComment(commentId)
    if(!comment) {
        throw new errors.NotFoundError({message:`Comment with id: ${commentId} was not found`})
    }

    if(comment.userId !== user.id && user.role !== "ADMIN") {
        throw new errors.NotAuthorizedError({message: "You are not authorized to perform this action"})
    }

    const result = await commentService.updateComment({...req.body})
    if(!result) {
        throw new errors.InternalServerError({message: `Could not update comment with id: ${commentId}`})
    }

    res.status(StatusCodes.OK).json({comment: result})
}

const responseComment = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!
    const commentId = req.params["commentId"]
    const {error: idError} = uuidSchema.validate(commentId)
    if(idError) {
        throw new errors.BadRequestError({message: `Invalid id: ${commentId}`})
    }
    const {error: validationError} = commentsValidator.createComment.validate(req.body)
    if(validationError) {
        throw new errors.BadRequestError({message: validationError.details[0].message})
    }
    const result = await commentService.updateComment({...req.body,userId: user.id, parentId: commentId})
    if(!result) {
        throw new errors.InternalServerError({message: `Could not update comment with id: ${commentId}`})
    }

    res.status(StatusCodes.OK).json({comment: result})
}

export const commentsControllers = {
    getComments,
    updateComment,
    deleteComment,
    createComment,
    responseComment,
}
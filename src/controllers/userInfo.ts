import type { Request, Response } from "express"
import { uuidSchema } from "../validators/uuid"
import BadRequestError from "../errors/BadRequestError"
import userInfoService from "../services/userInfo"
import NotFoundError from "../errors/NotFoundError"
import { StatusCodes } from "http-status-codes"
import { AuthenticatedReq } from "../middlewares/authorize"
import NotAuthorizedError from "../errors/NotAuthorizedError"
import userInfoValidator from "../validators/userInfo"
import { UserInfoInsert } from "../models/userInfo.model"
import InternalServerError from "../errors/InternalServerError"
import { randomUUID } from "crypto"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3Client } from "../s3Bucket"
import errors from "../errors"

const createUserInfo = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!
    const userInfoBody = JSON.parse(req.body.userInfo)
    if(!userInfoBody) {
        throw new errors.BadRequestError({message: "User info is required"})
    }
    const {error: validationError} = userInfoValidator.userInfoInsertSchema.validate(userInfoBody)
    if(validationError){
        throw new BadRequestError({message: validationError.details[0].message})
    }
    const exists = await userInfoService.fetchUserInfo(user.id)
    if(exists) {
        throw new BadRequestError({message: `UserInfo for user: ${user.id} already exists`})
    }
    let avatar_url
    if(req.file){

        const params = {
            Bucket: process.env.BUCKET_NAME!,
            Key: randomUUID(),
            Body: req.file?.buffer,
            ContentType: req.file?.mimetype
        }
        
        const command = new PutObjectCommand(params)
        await s3Client.send(command)
        avatar_url = `https://${process.env.BUCKET_NAME!}.s3.${process.env.BUCKET_REGION!}.amazonaws.com/${params.Key}`
    }


    const userInfo = {...userInfoBody, userId: user.id, birthDate: new Date(userInfoBody["birthDate"]), avatar: avatar_url} as UserInfoInsert

    const insertedUserInfo = await userInfoService.insertUserInfo(userInfo)
    if(!insertedUserInfo) {
        throw new InternalServerError({message: "Could not insert a userInfo: "+ userInfo})
    }

    res.status(StatusCodes.CREATED).json({userInfo:insertedUserInfo})
}
const updateUserInfo = async (req: AuthenticatedReq, res: Response) => {
    const id = req.params["userId"] as string
    const user = req.user!
    const {error: validationError} = uuidSchema.validate(id)
    if(validationError) {
        throw new BadRequestError({message: validationError.details[0].message})
    }

    if (user.id !== id && user.role !== "ADMIN") {
        throw new NotAuthorizedError({message: "You are not authorized to perform this action."})
    }


    const {error: validationUpdateError} = userInfoValidator.userInfoUpdateSchema.validate(req.body)
    if(validationUpdateError){
        throw new BadRequestError({message: validationUpdateError.details[0].message})
    }

    const userInfo = await userInfoService.updateUserInfo({...req.body, userId: id})
    if(!userInfo) {
        throw new NotFoundError({message: `Could not find userInfo for user: ${id}`})
    }

    res.status(StatusCodes.OK).json({userInfo}) 
}
const deleteUserInfo = async (req: AuthenticatedReq, res: Response) => {
    const id = req.params["userId"] as string
    const user = req.user!
    const {error: validationError} = uuidSchema.validate(id)
    if(validationError) {
        throw new BadRequestError({message: "Invalid id"})
    }

    if (user.id !== id && user.role !== "ADMIN") {
        throw new NotAuthorizedError({message: "You are not authorized to perform this action."})
    }

    const userInfo = await userInfoService.deleteUserInfo(id)
    if(!userInfo) {
        throw new NotFoundError({message: `Could not find userInfo for user: ${id}`})
    }

    res.status(StatusCodes.OK).json({userInfo})
}
const getUserInfo = async (req: Request, res: Response) => {
    const id = req.params["userId"] as string


    const {error: validationError} = uuidSchema.validate(id)
    if(validationError) {
        throw new BadRequestError({message: `Invalid id: ${id}`})
    }

    const userInfo = await userInfoService.fetchUserInfo(id)
    if(!userInfo) {
        throw new NotFoundError({message: `Could not find userInfo for user: ${id}`})
    }

    res.status(StatusCodes.OK).json({userInfo})
}

export default {
    createUserInfo,
    updateUserInfo,
    deleteUserInfo,
    getUserInfo
}
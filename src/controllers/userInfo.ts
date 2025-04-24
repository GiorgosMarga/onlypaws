import { type Request, type Response } from "express"
import { uuidSchema } from "../validators/uuid"
import BadRequestError from "../errors/BadRequestError"
import userInfoService from "../services/userInfo"
import NotFoundError from "../errors/NotFoundError"
import { StatusCodes } from "http-status-codes"
import { AuthenticatedReq } from "../middlewares/authorize"
import NotAuthorizedError from "../errors/NotAuthorizedError"
import userInfoValidator from "../validators/userInfo"
import InternalServerError from "../errors/InternalServerError"
import { randomUUID } from "crypto"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3Client } from "../s3Bucket"
import errors from "../errors"
import ParseValidationErrors from "../utils/parseValidationError"
import { redisClient } from "../redisClient"
import "dotenv/config"
interface UploadedFiles {
  [fieldname: string]: Express.Multer.File[];
}
const createUserInfo = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!
    const userInfoBody = JSON.parse(req.body.userInfo)
    if(!userInfoBody) {
        throw new errors.BadRequestError({message: "User info is required"})
    }
    const {error: validationError} = userInfoValidator.userInfoInsertSchema.validate(userInfoBody, {abortEarly: false})
    if(validationError){
        throw new errors.ValidationError({message: ParseValidationErrors(validationError)})
    }
    let userAvatarUrl;
    let dogAvatarUrl;

    if(!req.files) {  
        throw new errors.BadRequestError({message: "Two avatars are required"})
    }
    if(!(req.files as UploadedFiles)["userPic"]) {
        throw new errors.BadRequestError({message: "Please upload you profile image."})
    }
    if(!(req.files as UploadedFiles)["dogPic"]) {
        throw new errors.BadRequestError({message: "Please upload you dog's cute face."})
    }
    if(req.files) {
        const userParams = {
            Bucket: process.env.BUCKET_NAME!,
            Key: randomUUID(),
            Body: (req.files as UploadedFiles)["userPic"][0]?.buffer,
            ContentType: (req.files as UploadedFiles)["userPic"][0]?.mimetype
        }
        const dogParams = {
            Bucket: process.env.BUCKET_NAME!,
            Key: randomUUID(),
            Body: (req.files as UploadedFiles)["dogPic"][0]?.buffer,
            ContentType: (req.files as UploadedFiles)["dogPic"][0]?.mimetype
        }
        const userCommand = new PutObjectCommand(userParams)
        const dogCommand = new PutObjectCommand(dogParams)
        try{
            await Promise.all([
                s3Client.send(userCommand),
                s3Client.send(dogCommand)
            ])
        }catch(err) {
            const uploadErr = err + process.env.BUCKET_NAME!+ process.env.BUCKET_REGION!
            console.log(uploadErr, "bucketname: "+ process.env.BUCKET_NAME!,"region: "+ process.env.BUCKET_REGION! )
            throw new errors.InternalServerError({message: "Could not upload avatars"})
        }
        userAvatarUrl = `https://${process.env.BUCKET_NAME!}.s3.${process.env.BUCKET_REGION!}.amazonaws.com/${userParams.Key}`
        dogAvatarUrl = `https://${process.env.BUCKET_NAME!}.s3.${process.env.BUCKET_REGION!}.amazonaws.com/${dogParams.Key}`
    }


    const userInfo = {...userInfoBody, userId: user.id, birthDate: new Date(userInfoBody["birthDate"]), userAvatar: userAvatarUrl, dogAvatar: dogAvatarUrl}
    let insertedUserInfo;
    const exists = await userInfoService.fetchUserInfo(user.id)
    if(exists) {
        insertedUserInfo = await userInfoService.updateUserInfo(userInfo)    
    }else {
        insertedUserInfo = await userInfoService.insertUserInfo(userInfo)
    }
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
        throw new errors.ValidationError({message: ParseValidationErrors(validationError)})
    }

    if (user.id !== id && user.role !== "ADMIN") {
        throw new NotAuthorizedError({message: "You are not authorized to perform this action."})
    }


    const {error: validationUpdateError} = userInfoValidator.userInfoUpdateSchema.validate(req.body)
    if(validationUpdateError){
        throw new errors.ValidationError({message: ParseValidationErrors(validationUpdateError)})
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

    const cachedUserInfo = await redisClient.get(`userInfo-${id}`)
    if(cachedUserInfo){
        res.status(StatusCodes.OK).json({userInfo: JSON.parse(cachedUserInfo)})
        return
    }
     const userInfo = await userInfoService.fetchUserInfo(id)
    if(!userInfo) {
        throw new NotFoundError({message: `Could not find userInfo for user: ${id}`})
    }

    await redisClient.setEx(`userInfo-${id}`, 10, JSON.stringify(userInfo))
    res.status(StatusCodes.OK).json({userInfo})
}

export default {
    createUserInfo,
    updateUserInfo,
    deleteUserInfo,
    getUserInfo
}
import "dotenv/config"
import { Request, Response } from "express";
import {  StatusCodes } from "http-status-codes";
import { emailSchema, otpSchema, userLoginSchema, userSchema, userUpdateSchema } from "../validators/user";
import { User } from "../models/user.model";
import NotFoundError from "../errors/NotFoundError";
import ValidationError from "../errors/ValidationError";
import { db } from "../db";
import { usersTable } from "../db/schema/users";
import { comparePasswords, hashPassword } from "../utils/password";
import { eq,  and,  gt } from "drizzle-orm";
import BadRequestError from "../errors/BadRequestError";
import { uuidSchema } from "../validators/uuid";
import { generateRefreshToken, getRefreshToken, signToken } from "../utils/token";
import NotAuthorizedError from "../errors/NotAuthorizedError";
import { deleteRefreshToken, insertRefreshToken } from "../services/token";
import { deleteResetToken, fetchUserByEmail, fetchUserById, fetchUserFromResetToken, fetchUsers, insertPasswordResetToken, insertUser } from "../services/user";
import { AuthenticatedReq } from "../middlewares/authorize";
import generateOTP from "../utils/generateOTP";
import { otpsTable } from "../db/schema/otps";
import { updateUser as updateUserService,deleteUser as deleteUserService } from "../services/user";
import generateRandomHex from "../utils/generateRandomHex";
import convertToMs from "../utils/convertToMs";

const TOKEN_LENGTH = 16
// TODO: check if all bodies, params and queries are validated

export const getUserByID = async (req:Request, res:Response) => {
    const {id} = req.params

    const {error: idError} = uuidSchema.validate(req.params)

    if(idError) {
        throw new BadRequestError({message:"invalid id format"})
    }


    const user = await fetchUserById(id)
    if(!user) {
        throw new NotFoundError({message: `User with id: ${id} was not found.`})
    }
    res.status(StatusCodes.OK).json({user})
    
}

export const getUsers = async (req:Request, res:Response) => {

    let page: number = Number(req.query.page)
    let limit: number = Number(req.query.limit)

    if(isNaN(page) || page < 0) {
        page = 1
    }
    if (isNaN(limit) || limit< 0){
        limit = 10
    }
    const users = await fetchUsers({page,limit})
    res.status(StatusCodes.OK).json({users})
}

export const createUser = async (req:Request, res:Response) => {
    const {error: validationError} = userSchema.validate(req.body)
    if (validationError) {
        throw new ValidationError({message: validationError.details[0].message})
    }

    let user = req.body as User
    const exists = await fetchUserByEmail(user.email)
    if(exists){
        throw new BadRequestError({message: "Email already in use."})
    }
    user.password = hashPassword(user.password)
    const insrtedUser = await insertUser(user)
    res.status(StatusCodes.CREATED).json({user: insrtedUser})
}
 
// forgotPassword is used to generate a token for password reset
export const forgotPassword = async (req: Request, res: Response) => {
    const {error: validationError} = emailSchema.validate(req.body)
    if (validationError) {
        throw new BadRequestError({message:validationError.details[0].message})
    } 

    const {email} = req.body

    const user = await fetchUserByEmail(email)
    if(!user) {
        // user doesnt exist still send OK 
        res.status(StatusCodes.OK).json({message: "Success"})
        return
    }

    const token = generateRandomHex(TOKEN_LENGTH)
    

    const passwordToken = await insertPasswordResetToken(token,user.id)
    
    res.status(StatusCodes.OK).json({token:passwordToken})
}

export const resetPassword = async (req: Request, res: Response) => {
    const {error: validationError} = userUpdateSchema.validate(req.body)
    if (validationError) {
        throw new BadRequestError({message:validationError.details[0].message})
    } 
    const { password } = req.body

    const token = req.query["token"] as string


    
    
    // TODO: fix 2 * token_length
    if(!token || token.length !== 2*TOKEN_LENGTH) {
        throw new BadRequestError({message:"A valid token must be provided."})
    }


    const user = await fetchUserFromResetToken(token)
    if(!user || !user.users) {
        throw new BadRequestError({message: "Invalid token"})
    }
    user.users.password = hashPassword(password)

    const updatedUser = await updateUserService(user.users)
    if(!updateUser) {
        throw new NotFoundError({message: `User with id: ${user.users.id} was not found.`})
    }
    await deleteResetToken(user.password_tokens.token)
    res.status(StatusCodes.OK).json({user: updatedUser})
}
export const updateUser = async(req: AuthenticatedReq, res: Response) => {
    const {id} = req.params

    const {error: idError} = uuidSchema.validate(req.params)

    if(idError) {
        throw new BadRequestError({message:"invalid id format"})
    }

    const user = req.user!

    if(user.id !== id && user.role != "ADMIN") {
        throw new NotAuthorizedError({message:"You are not authorized to perform this action."})
    }

    const {error: validationError} = userUpdateSchema.validate(req.body)
    if(validationError){
        throw new ValidationError({message:validationError.details[0].message})
    }

    if(req.body["password"]) {
        req.body["password"] = hashPassword(req.body["password"])
    }

    let updatedUser = {id,...req.body}

    updatedUser = await updateUserService(updatedUser)
    if(!updatedUser) {
        throw new NotFoundError({message: `User with id: ${id} was not found.`})
    }

    res.status(StatusCodes.OK).json({user: updatedUser})
}

export const deleteUser = async (req: AuthenticatedReq, res: Response) => {
    const {id} = req.params

    const user = req.user!

    if(user.id !== id && user.role != "ADMIN") {
        throw new NotAuthorizedError({message:"You are not authorized to perform this action."})
    }

    const {error: idError} = uuidSchema.validate(req.params)
    if(idError) {
        throw new BadRequestError({message:"invalid id format"})
    }


    const deletedUser = await deleteUserService(id)

    if(!deletedUser) {
        throw new NotFoundError({message: `User with id: ${id} was not found.`})
    }

    res.status(StatusCodes.OK).json({user: deletedUser})
}

export const loginUser = async (req: Request, res: Response) => {
    const {error: validationError, value} = userLoginSchema.validate(req.body)
    if(validationError) {
        throw new ValidationError({message: validationError.details[0].message})
    }

    const {
        email,
        password
    } = value

    const user = await fetchUserByEmail(email)
    if(!user) {
        throw new ValidationError({message:"Invalid credentials"})
    }

    if(!comparePasswords(user.password, password )){
        throw new ValidationError({message: "invalid credentials"})
    }

    // TODO: change this to 5m
    const refreshTokenExpirationDate = new Date(Date.now() + convertToMs(7,"d")) // <- 7 days
    const accessToken = signToken({user}, process.env.JWT_ACCESS_SECRET!, {expiresIn: "1h"})
    const refreshToken = generateRefreshToken(user.id,refreshTokenExpirationDate) 
    await insertRefreshToken(refreshToken)
    
    const signedRefreshToken = signToken({refreshToken}, process.env.JWT_REFRESH_SECRET!, {expiresIn: "7d"})


    res.cookie('access_token',accessToken, { maxAge: convertToMs(1,"h") , httpOnly: true }); // <- 1 h
    res.cookie('refresh_token',signedRefreshToken, { maxAge: convertToMs(7,"d") , httpOnly: true }); // <- 7 days
    // return user only for testing
    res.status(StatusCodes.OK).json({user, access_token: accessToken, refresh_token: signedRefreshToken})

}

export const sendOTP = async (req: AuthenticatedReq, res: Response) => {
    const user  = req.user!
    
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + convertToMs(5,"min"))
    const newOTP = await db.insert(otpsTable).values({otp,expiresAt, userId: user.id}).returning()

    res.status(StatusCodes.OK).json({otp: newOTP})
}

export const verifyUser = async (req: AuthenticatedReq, res: Response) => {
    const {error: validationError} = otpSchema.validate(req.body)
    if(validationError) {
        throw new ValidationError({message: validationError.details[0].message})
    }
    const {otp} = req.body
    const user = req.user!

    const currentTimestamp = new Date(Date.now())
    const fetchedOTP = await db.delete(otpsTable).where(and(eq(otpsTable.userId, user.id),eq(otpsTable.otp,otp), gt(otpsTable.expiresAt, currentTimestamp))).returning()

    if(fetchedOTP.length === 0) {
        throw new BadRequestError({message: "Invalid OTP"})
    }

    // need to update user to verified
    await db.update(usersTable).set({isVerified: true}).where(eq(usersTable.id,user.id))

    res.status(StatusCodes.OK).json({message: "Success"})

}

export const logout = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!

    const refreshTokenPayload = getRefreshToken(req)

    if(refreshTokenPayload) {
        await deleteRefreshToken(refreshTokenPayload.id,user.id)
    }


    res.cookie("access_token","")
    res.cookie("refresh_token","")
    res.status(StatusCodes.OK).json({message: "Success"})
}
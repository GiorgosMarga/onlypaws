import "dotenv/config"
import { Request, Response } from "express";
import {  StatusCodes } from "http-status-codes";
import { otpSchema, userLoginSchema, userSchema, userUpdateSchema } from "../validators/user";
import { User } from "../models/user.model";
import NotFoundError from "../errors/NotFoundError";
import ValidationError from "../errors/ValidationError";
import { db } from "../db";
import { usersTable } from "../db/schema/users";
import { comparePasswords, hashPassword } from "../utils/password";
import { eq, count, and } from "drizzle-orm";
import BadRequestError from "../errors/BadRequestError";
import { uuidSchema } from "../validators/uuid";
import {calculateOffset} from "../utils/calculateOffset"
import { generateRefreshToken, signToken } from "../utils/token";
import NotAuthorizedError from "../errors/NotAuthorizedError";
import { insertRefreshToken } from "../services/token";
import { fetchUserByEmail } from "../services/user";
import { AuthenticatedReq } from "../middlewares/authorize";
import generateOTP from "../utils/generateOTP";
import { error } from "console";


export const getUserByID = async (req:Request, res:Response) => {
    const {id} = req.params

    const {error: idError} = uuidSchema.validate(req.params)

    if(idError) {
        throw new BadRequestError({message:"invalid id format"})
    }


    const user = await db.select().from(usersTable).where(eq(usersTable.id,id))
    if(!user[0]) {
        throw new NotFoundError({message: `User with id: ${id} was not found.`})
    }
    res.status(StatusCodes.OK).json({user: user[0]})
    
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

    const users = await db.select().from(usersTable).limit(limit).offset(calculateOffset(page,limit))

    res.status(StatusCodes.OK).json({users})
}

export const createUser = async (req:Request, res:Response) => {
    const {error: validationError} = userSchema.validate(req.body)
    if (validationError) {
        throw new ValidationError({message: validationError.details[0].message})
    }

    let user = req.body

    const exists = await db.select({count: count()}).from(usersTable).where(eq(usersTable.email,user.email))
    if(exists[0].count !== 0) {
        throw new BadRequestError({message: "emails already exists"})
    }
    user.password = hashPassword(user.password)
    const result = await db.insert(usersTable).values(user).returning({id: usersTable.id})
    user.id = result[0].id
    res.status(StatusCodes.CREATED).json({user})
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
        console.log("Updating password")
        req.body["password"] = hashPassword(req.body["password"])
    }

    const updatedUser = await db.update(usersTable).set({...req.body, updatedAt: new Date()}).where(eq(usersTable.id,id)).returning()
    if(updatedUser.length === 0) {
        throw new NotFoundError({message: `User with id: ${id} was not found.`})
    }

    res.status(StatusCodes.OK).json({user: updatedUser[0]})
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


    const deletedUser = await db.delete(usersTable).where(eq(usersTable.id, id)).returning()

    if(deletedUser.length === 0) {
        throw new NotFoundError({message: `User with id: ${id} was not found.`})
    }

    res.status(StatusCodes.OK).json({user: deletedUser[0]})
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
    const accessToken = signToken(user, process.env.JWT_ACCESS_SECRET!, {expiresIn: "5m"})

    const refreshToken = generateRefreshToken(user.id,new Date(Date() + 7 * 24 * 60 * 60 * 1000)) 
    await insertRefreshToken(refreshToken)
    
    const signedRefreshToken = signToken(refreshToken, process.env.JWT_REFRESH_SECRET!, {expiresIn: "7d"})


    res.cookie('access_token',accessToken, { maxAge: 15 * 1000 * 60 , httpOnly: true }); // <- 15 minutes
    res.cookie('refresh_token',signedRefreshToken, { maxAge: 7 * 1000 * 60 * 60 * 24 , httpOnly: true }); // <- 7 days
    // return user only for testing
    res.status(StatusCodes.OK).json({user, access_token: accessToken, refresh_token: signedRefreshToken})

}

export const sendOTP = async (req: AuthenticatedReq, res: Response) => {
    const user  = req.user!
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60  * 1000)
    const updatedUser = await db.update(usersTable).set({otp, otpExpiresAt:expiresAt}).where(eq(usersTable.id,user.id)).returning()

    res.status(StatusCodes.OK).json({updatedUser})
}

export const verifyUser = async (req: AuthenticatedReq, res: Response) => {
    const {error: validationError} = otpSchema.validate(req.body)
    if(validationError) {
        throw new ValidationError({message: validationError.details[0].message})
    }
    const {otp} = req.body
    const user = req.user!

    const fetchedUser = await db.update(usersTable).set({isVerified: true}).where(eq(usersTable.id, user.id)).returning()

    if(fetchedUser.length === 0) {
        throw new NotFoundError({message: `User with id: ${user.id} was not found`})
    }
    console.log(fetchedUser)
    if(fetchedUser[0].otp !== otp || fetchedUser[0].otpExpiresAt! < new Date()) {
        throw new BadRequestError({message: "Invalid OTP"})
    }

    if(fetchedUser[0].isVerified) {
        throw new BadRequestError({message: "User is already verified."})
    }

    res.status(StatusCodes.OK).json({message: "Success"})

}
import "dotenv/config"
import { Request, Response } from "express";
import {  StatusCodes } from "http-status-codes";
import { emailSchema, googleCodeSchema, otpSchema, userLoginSchema, userSchema, userUpdateSchema } from "../validators/user";
import type { User, UserInsert } from "../models/user.model";
import NotFoundError from "../errors/NotFoundError";
import ValidationError from "../errors/ValidationError";
import { db } from "../db";
import { usersTable } from "../db/schema/users";
import { comparePasswords, hashPassword } from "../utils/password";
import { eq,  and,  gt } from "drizzle-orm";
import BadRequestError from "../errors/BadRequestError";
import { uuidSchema } from "../validators/uuid";
import {getRefreshToken } from "../utils/token";
import NotAuthorizedError from "../errors/NotAuthorizedError";
import { createTokens, deleteRefreshToken } from "../services/token";
import { deleteResetToken, fetchUserByEmail, fetchUserById, fetchUserFromResetToken, fetchUsers, insertPasswordResetToken, insertUser } from "../services/user";
import { AuthenticatedReq } from "../middlewares/authorize";
import generateOTP from "../utils/generateOTP";
import { otpsTable } from "../db/schema/otps";
import { updateUser as updateUserService,deleteUser as deleteUserService } from "../services/user";
import generateRandomHex from "../utils/generateRandomHex";
import convertToMs from "../utils/convertToMs";
import InternalServerError from "../errors/InternalServerError";

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

    let user = req.body as UserInsert
    const exists = await fetchUserByEmail(user.email)
    if(exists){
        throw new BadRequestError({message: "Email already in use."})
    }
    user.password = hashPassword(user.password!)
    const insertedUser = await insertUser(user)
    res.status(StatusCodes.CREATED).json({user: insertedUser})
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
    // if not user.password -> user was registered using google auth
    if(!user || !user.password) {
        throw new ValidationError({message:"Invalid credentials"})
    }

    
    if(!comparePasswords(user.password, password )){
        throw new ValidationError({message: "invalid credentials"})
    }

    const [accessToken, refreshToken] = await createTokens(user)

    res.cookie('access_token',accessToken, { maxAge: convertToMs(1,"h") , httpOnly: true }); // <- 1 h
    res.cookie('refresh_token',refreshToken, { maxAge: convertToMs(7,"d") , httpOnly: true }); // <- 7 days
    // return user only for testing
    res.status(StatusCodes.OK).json({user, access_token: accessToken, refresh_token: refreshToken})

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
    const fetchedOTP = await db.delete(otpsTable).where(and(eq(otpsTable.userId, user.id!),eq(otpsTable.otp,otp), gt(otpsTable.expiresAt, currentTimestamp))).returning()

    if(fetchedOTP.length === 0) {
        throw new BadRequestError({message: "Invalid OTP"})
    }

    // need to update user to verified
    await db.update(usersTable).set({isVerified: true}).where(eq(usersTable.id,user.id!))

    res.status(StatusCodes.OK).json({message: "Success"})

}

export const logout = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!

    const refreshTokenPayload = getRefreshToken(req)

    if(refreshTokenPayload) {
        await deleteRefreshToken(refreshTokenPayload.id!,user.id!)
    }


    res.cookie("access_token","")
    res.cookie("refresh_token","")
    res.status(StatusCodes.OK).json({message: "Success"})
}

export const registerGoogleUser = async (req: Request, res: Response) => {
    console.log(req.query)
    const {error: validationError} = googleCodeSchema.validate(req.query)

    if(validationError) {
        throw new BadRequestError({message: validationError.details[0].message})
    }


    const code = req.query["code"] as string

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: `http://localhost:${process.env.PORT}/api/v1/users/register-google/callback`,
            grant_type: "authorization_code",
            code, // The authorization code from Google
        })
    });

    if(!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        throw new InternalServerError({message: "Error fetching token "+ errorData})
    }
    
    const data = await tokenResponse.json() 
    if(!data.access_token) {
        throw new InternalServerError({message: "No access_token: "+data})
    }

    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        method: "GET",
        headers: { Authorization: `Bearer ${data.access_token}` },
    });

    const userData = await userResponse.json();
    console.log(userData)
    let user = await fetchUserByEmail(userData.email)
    if(!user) {
        user = await insertUser({
            email: userData.email,
            google_id: userData.id,
            username: userData.name
        })
        if(!user) {
            throw new InternalServerError({message:"Error registering user"})
        }
    }

    // TODO: change this to 15m
    const [accessToken, refreshToken] = await createTokens(user)
    res.cookie('access_token',accessToken, { maxAge: convertToMs(1,"h") , httpOnly: true }); // <- 1 h
    res.cookie('refresh_token',refreshToken, { maxAge: convertToMs(7,"d") , httpOnly: true }); // <- 7 days
    // return user only for testing
    res.status(StatusCodes.OK).json({user, access_token: accessToken, refresh_token: refreshToken})

}

export const generateGoogleUserCode = async (req: Request, res:Response) => {
    const redirectUri = `http://localhost:${process.env.PORT}/api/v1/users/register-google/callback`;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid email profile`;
    console.log("Redirecting to:",authUrl)
    res.redirect(authUrl);
}
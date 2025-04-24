import "dotenv/config"
import type { Request, Response } from "express";
import {  StatusCodes } from "http-status-codes";
import userValidator from "../validators/user";
import { uuidSchema } from "../validators/uuid";
import type { GithubUserData, UserData, UserInsert } from "../models/user.model";
import { comparePasswords, hashPassword } from "../utils/password";
import {getRefreshToken } from "../utils/token";
import tokenService from "../services/token";
import userService from "../services/user";
import { AuthenticatedReq } from "../middlewares/authorize";
import generateOTP from "../utils/generateOTP";
import generateRandomHex from "../utils/generateRandomHex";
import convertToMs from "../utils/convertToMs";
import otpService from "../services/otp"
import errors from "../errors";
import ParseValidationErrors from "../utils/parseValidationError";
import { redisClient } from "../redisClient"

const TOKEN_LENGTH = 16

export const getUserByID = async (req:Request, res:Response) => {
    const {userId: id} = req.params

    const {error: idError} = uuidSchema.validate(id)

    if(idError) {
        throw new errors.BadRequestError({message:"invalid id format"})
    }


    const user = await userService.fetchUserById(id)
    if(!user) {
        throw new errors.NotFoundError({message: `User with id: ${id} was not found.`})
    }
    const {password, ...safeUser} = user    
    res.status(StatusCodes.OK).json({user: safeUser})
    
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
    const users = await userService.fetchUsers({page,limit})
    res.status(StatusCodes.OK).json({users})
}

export const createUser = async (req:Request, res:Response) => {
    const {error: validationError} = userValidator.userSchema.validate(req.body, {abortEarly: false})
    if (validationError) {
        throw new errors.BadRequestError({message: ParseValidationErrors(validationError)})
    }

    let user = req.body as UserInsert
    const exists = await userService.fetchUserByEmail(user.email)
    if(exists){
        throw new errors.BadRequestError({message: {email:"Email already in use."}})
    }
    user.password = hashPassword(user.password!)
    const insertedUser = await userService.insertUser(user)
    if(!insertedUser){
        throw new errors.InternalServerError({message: "Could not create user"})
    }

    const [accessToken, refreshToken] = await tokenService.createTokens(insertedUser)

    res.cookie('access_token',accessToken, { maxAge: convertToMs(1,"h") , httpOnly: true }); // <- 1 h
    res.cookie('refresh_token',refreshToken, { maxAge: convertToMs(7,"d") , httpOnly: true }); // <- 7 days
    // return user only for testing
    const {password, ...safeUser} = insertedUser
    res.status(StatusCodes.CREATED).json({user:safeUser})
}
 
// forgotPassword is used to generate a token for password reset
export const forgotPassword = async (req: Request, res: Response) => {
    const {error: validationError} = userValidator.emailSchema.validate(req.body)
    if (validationError) {
        throw new errors.BadRequestError({message:validationError.details[0].message})
    } 

    const {email} = req.body

    const user = await userService.fetchUserByEmail(email)
    if(!user) {
        // user doesnt exist still send OK 
        res.status(StatusCodes.OK).json({message: "Success"})
        return
    }

    const token = generateRandomHex(TOKEN_LENGTH)
    

    const passwordToken = await userService.insertPasswordResetToken(token,user.id)
    
    res.status(StatusCodes.OK).json({token:passwordToken})
}

export const resetPassword = async (req: Request, res: Response) => {
    const {error: validationError} = userValidator.userUpdateSchema.validate(req.body)
    if (validationError) {
        throw new errors.BadRequestError({message: ParseValidationErrors(validationError)})
    } 
    const { password } = req.body

    const token = req.query["token"] as string


    
    
    // TODO: fix 2 * token_length
    if(!token || token.length !== 2*TOKEN_LENGTH) {
        throw new errors.BadRequestError({message:"A valid token must be provided."})
    }


    const user = await userService.fetchUserFromResetToken(token)
    if(!user || !user.users) {
        throw new errors.BadRequestError({message: "Invalid token"})
    }
    user.users.password = hashPassword(password)

    const updatedUser = await userService.updateUser(user.users)
    if(!updatedUser) {
        throw new errors.NotFoundError({message: `User with id: ${user.users.id} was not found.`})
    }
    await userService.deleteResetToken(user.password_tokens.token)
    const {password: userPassword, ...safeUser} = updatedUser

    res.status(StatusCodes.OK).json({user: safeUser})
}
export const updateUser = async(req: AuthenticatedReq, res: Response) => {
    const {userId: id} = req.params

    const {error: idError} = uuidSchema.validate(id)

    if(idError) {
        throw new errors.BadRequestError({message:"invalid id format"})
    }

    const user = req.user!

    if(user.id !== id && user.role != "ADMIN") {
        throw new errors.NotAuthorizedError({message:"You are not authorized to perform this action."})
    }

    const {error: validationError} = userValidator.userUpdateSchema.validate(req.body)
    if(validationError){
        throw new errors.ValidationError({message: ParseValidationErrors(validationError)})
    }

    if(req.body["password"]) {
        req.body["password"] = hashPassword(req.body["password"])
    }

    let updatedUser = {...req.body,id}

    updatedUser = await userService.updateUser(updatedUser)
    if(!updatedUser) {
        throw new errors.NotFoundError({message: `User with id: ${id} was not found.`})
    }
    const {password, ...safeUser} = updatedUser
    res.status(StatusCodes.OK).json({user: safeUser})
}

export const deleteUser = async (req: AuthenticatedReq, res: Response) => {
    const {userId: id} = req.params

    const user = req.user!

    if(user.id !== id && user.role != "ADMIN") {
        throw new errors.NotAuthorizedError({message:"You are not authorized to perform this action."})
    }

    const {error: idError} = uuidSchema.validate(id)
    if(idError) {
        throw new errors.BadRequestError({message:"invalid id format"})
    }


    const deletedUser = await userService.deleteUser(id)

    if(!deletedUser) {
        throw new errors.NotFoundError({message: `User with id: ${id} was not found.`})
    }

    const {password, ...safeUser} = deletedUser
    res.status(StatusCodes.OK).json({user: safeUser})
}

export const loginUser = async (req: Request, res: Response) => {
    const {error: validationError, value} = userValidator.userLoginSchema.validate(req.body)
    if(validationError) {
        throw new errors.ValidationError({message: ParseValidationErrors(validationError)})
    }

    const {
        email,
        password
    } = value

    const user = await userService.fetchUserByEmail(email)
    // if not user.password -> user was registered using google auth
    if(!user || !user.password) {
        throw new errors.ValidationError({message:"Invalid credentials"})
    }

    
    if(!comparePasswords(user.password, password )){
        throw new errors.ValidationError({message: "invalid credentials"})
    }

    if(user.isBanned) {
        throw new errors.BadRequestError({message: {email: "User is banned"}})
    }

    const [accessToken, refreshToken] = await tokenService.createTokens(user)

    res.cookie('access_token',accessToken, { maxAge: convertToMs(1,"h") , httpOnly: true, sameSite:"none", secure:true }); // <- 1 h
    res.cookie('refresh_token',refreshToken, { maxAge: convertToMs(7,"d") , httpOnly: true, sameSite:"none", secure:true }); // <- 7 days
    // return user only for testing
    // res.status(StatusCodes.OK).json({user, access_token: accessToken, refresh_token: refreshToken})
    res.status(StatusCodes.OK).json({userId: user.id})

}

export const sendOTP = async (req: AuthenticatedReq, res: Response) => {
    const user  = req.user!
    if(user.isVerified) {
        throw new errors.BadRequestError({message: "You are already verified"})
    }
    
    const otpNumber = generateOTP()
    const expiresAt = new Date(Date.now() + convertToMs(5,"min"))
    const otp = await otpService.insertOTP({otp: otpNumber,expiresAt, userId: user.id})
    if(!otp){
        throw new errors.InternalServerError({message: "Could not generate a new OTP"})
    }

    res.status(StatusCodes.OK).json({otp: otp})
}
 
export const verifyUser = async (req: AuthenticatedReq, res: Response) => {
    const {error: validationError} = userValidator.otpSchema.validate(req.body)
    if(validationError) {
        throw new errors.ValidationError({message: validationError.details[0].message})
    }
    const otp = Number(req.body["otp"])
    const user = req.user!

    if(isNaN(otp)){
        throw new errors.BadRequestError({message: "Invalid otp code"})
    }

    const currentTimestamp = new Date(Date.now())

    const fetchedOTP = await otpService.deleteOTP(otp,user.id,currentTimestamp)
    if(!fetchedOTP) {
        throw new errors.BadRequestError({message: "Invalid otp code"})
    }

    // need to update user to verified
    await userService.verifyUser(user.id)

    res.status(StatusCodes.OK).json({message: "Success"})

}

export const logout = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!

    const refreshTokenPayload = getRefreshToken(req)

    if(refreshTokenPayload) {
        await tokenService.deleteRefreshToken(refreshTokenPayload.id!,user.id!)
    }


    res.cookie("access_token","")
    res.cookie("refresh_token","")
    res.status(StatusCodes.OK).json({message: "Success"})
}

export const registerGoogleUser = async (req: Request, res: Response) => {
    const {error: validationError} = userValidator.googleCodeSchema.validate(req.query)

    if(validationError) {
        throw new errors.BadRequestError({message: ParseValidationErrors(validationError)})
    }


    const code = req.query["code"] as string
    // TODO: find these urls
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
        throw new errors.InternalServerError({message: "Error fetching token "+ errorData})
    }
    
    const data = await tokenResponse.json() 
    if(!data.access_token) {
        throw new errors.InternalServerError({message: "No access_token: "+data})
    }

    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        method: "GET",
        headers: { Authorization: `Bearer ${data.access_token}` },
    });

    const userData = await userResponse.json() as UserData;
    let user = await userService.fetchUserByEmail(userData.email)
    if(!user) {
        user = await userService.insertUser({
            email: userData.email,
            google_id: userData.id,
            username: userData.name,
            profilePic: userData.picture
        })
        if(!user) {
            throw new errors.InternalServerError({message:"Error registering user"})
        }
    }else if (!user.google_id) {
        // user already exists in the db, link account to the google account as well
        await userService.updateUser({...user,google_id: userData.id})
    }

    // TODO: change this to 15m

    
    const [accessToken, refreshToken] = await tokenService.createTokens(user)
    res.cookie('access_token',accessToken, { maxAge: convertToMs(1,"h") , httpOnly: true, sameSite:"none", secure:true }); // <- 1 h
    res.cookie('refresh_token',refreshToken, { maxAge: convertToMs(7,"d") , httpOnly: true, sameSite:"none", secure:true });
    // return user only for testing
    res.redirect(process.env.FRONTEND_URL!) // <- redirect to the frontend
    // res.status(StatusCodes.CREATED).json({message: "success"})

}
export const registerGithubUser = async (req: Request, res: Response) => {

    const code = req.query["code"] as string
    if(!code) {
        throw new errors.BadRequestError({message:"Missing code"})
    }
    // TODO: find these urls
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "accept": "application/json","Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
            client_id: process.env.GITHUB_CLIENT_ID!,
            client_secret: process.env.GITHUB_CLIENT_SECRET!,
            code
        })
    });

    if(!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        throw new errors.InternalServerError({message: "Error fetching token "+ errorData})
    }
    
    const data = await tokenResponse.json() 
    if(!data.access_token) {
        throw new errors.InternalServerError({message: "No access_token: "+data})
    }

    const userResponse = await fetch("https://api.github.com/user", {
        method: "GET",
        headers: { Authorization: `Bearer ${data.access_token}` },
    });
    
    const userData = await userResponse.json() as GithubUserData;
    
    // find user's email, gihub some times doesnt returnthe email even if it is public?
    const emailResponse = await fetch("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const emails = await emailResponse.json();

    // Get primary, verified email
    const primaryEmail = emails.find((email: any) => email.primary && email.verified)?.email || null;
    if(!primaryEmail) {
        throw new errors.BadRequestError({message: "User has no email registered"})
    }
    let user = await userService.fetchUserByEmail(primaryEmail)
    if(!user) {
        user = await userService.insertUser({
            email: primaryEmail,
            github_id: userData.id,
            username: userData.name || userData.login,
            profilePic: userData.avatar_url
        })
        if(!user) {
            throw new errors.InternalServerError({message:"Error registering user"})
        }
    }else if (!user.github_id) {
        await userService.updateUser({...user,github_id: userData.id})
    }

    // TODO: change this to 15m
    const [accessToken, refreshToken] = await tokenService.createTokens(user)
    res.cookie('access_token',accessToken, { maxAge: convertToMs(1,"h") , httpOnly: true, sameSite:"none", secure:true }); // <- 1 h
    res.cookie('refresh_token',refreshToken, { maxAge: convertToMs(7,"d") , httpOnly: true, sameSite:"none", secure:true });
    // return user only for testing
    res.status(StatusCodes.CREATED).json({message: "success"})

}

export const generateGithubUserCode = async (req: Request, res: Response) => {
    const redirectUri = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
    res.redirect(redirectUri);
}

export const generateGoogleUserCode = async (req: Request, res:Response) => {
    const redirectUri = `http://localhost:${process.env.PORT}/api/v1/users/register-google/callback`;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid email profile`;
    console.log("Redirecting to:",authUrl)
    res.redirect(authUrl);
}


export const whoAmI = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!


    const cachedUser = await redisClient.get(user.id)
    if(cachedUser) {
        res.status(StatusCodes.OK).json({userId: cachedUser})
        return
    }

    const fetchedUser = await userService.fetchUserById(user.id)
    if(!fetchedUser) {
        throw new errors.NotFoundError({message: `User with id: ${user.id} doesn't exist`})
    }

    await redisClient.set(user.id, fetchedUser.id)

    res.status(StatusCodes.OK).json({
        userId: user.id
    })
}
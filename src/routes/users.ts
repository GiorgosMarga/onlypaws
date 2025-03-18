import { Router } from "express";
import { createUser, deleteUser, forgotPassword, generateGithubUserCode, generateGoogleUserCode, getUserByID, getUsers, loginUser, registerGithubUser, registerGoogleUser, resetPassword, sendOTP, updateUser, verifyUser, whoAmI } from "../controllers/users";
import authenticate from "../middlewares/authenticate";


export const userRouter = Router()

userRouter.post("/login",loginUser)
userRouter.get("/whoAmI",authenticate,whoAmI)
userRouter.get("/register-google/callback",registerGoogleUser)
userRouter.get("/register-google",generateGoogleUserCode)
userRouter.get("/register-github/callback",registerGithubUser)
userRouter.get("/register-github",generateGithubUserCode)
userRouter.post("/forgot-password",forgotPassword)
userRouter.patch("/reset-password",resetPassword)
userRouter.post("/send-otp",authenticate, sendOTP)
userRouter.post("/verify",authenticate, verifyUser)
userRouter.get("/:userId", getUserByID)
userRouter.get("/", getUsers)
userRouter.post("/",createUser)
userRouter.patch("/:userId", authenticate,updateUser)
userRouter.delete("/:userId",authenticate,deleteUser)

import { Router } from "express";
import { createUser, deleteUser, forgotPassword, getUserByID, getUsers, loginUser, resetPassword, sendOTP, updateUser, verifyUser } from "../controllers/users";
import authenticate from "../middlewares/authenticate";


export const userRouter = Router()

userRouter.post("/login",loginUser)
userRouter.post("/forgot-password",forgotPassword)
userRouter.patch("/reset-password",resetPassword)
userRouter.post("/send-otp",authenticate, sendOTP)
userRouter.post("/verify",authenticate, verifyUser)
userRouter.get("/:id", getUserByID)
userRouter.get("/", getUsers)
userRouter.post("/",createUser)
userRouter.patch("/:id", authenticate,updateUser)
userRouter.delete("/:id",authenticate,deleteUser)

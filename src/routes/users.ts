import { Router } from "express";
import { createUser, deleteUser, getUserByID, getUsers, loginUser, sendOTP, updateUser, verifyUser } from "../controllers/users";
import authenticate from "../middlewares/authenticate";


export const userRouter = Router()

userRouter.post("/login",loginUser)
userRouter.post("/send-otp",authenticate, sendOTP)
userRouter.post("/verify",authenticate, verifyUser)
userRouter.get("/:id", getUserByID)
userRouter.get("/", getUsers)
userRouter.post("/",createUser)
userRouter.patch("/:id", authenticate,updateUser)
userRouter.delete("/:id",authenticate,deleteUser)

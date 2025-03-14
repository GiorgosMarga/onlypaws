import {Router} from "express"
import userInfoControllers from "../controllers/userInfo"
import authenticate from "../middlewares/authenticate"

export const userInfoRouter = Router()

userInfoRouter.get("/:userId", userInfoControllers.getUserInfo)
userInfoRouter.post("/",authenticate, userInfoControllers.createUserInfo)
userInfoRouter.patch("/:userId", authenticate,userInfoControllers.updateUserInfo)
userInfoRouter.delete("/:userId", authenticate,userInfoControllers.deleteUserInfo)
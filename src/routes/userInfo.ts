import {Router} from "express"
import userInfoControllers from "../controllers/userInfo"
import authenticate from "../middlewares/authenticate"

export const userInfoRouter = Router()

userInfoRouter.get("/:id", userInfoControllers.getUserInfo)
userInfoRouter.post("/",authenticate, userInfoControllers.createUserInfo)
userInfoRouter.patch("/:id", authenticate,userInfoControllers.updateUserInfo)
userInfoRouter.delete("/:id", authenticate,userInfoControllers.deleteUserInfo)
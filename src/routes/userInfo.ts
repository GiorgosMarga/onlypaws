import {Router} from "express"
import userInfoControllers from "../controllers/userInfo"
import authenticate from "../middlewares/authenticate"
import multer from "multer"

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
export const userInfoRouter = Router()

userInfoRouter.get("/:userId", userInfoControllers.getUserInfo)
userInfoRouter.post("/",authenticate,upload.fields([{ name: 'userPic', maxCount: 1 }, { name: 'dogPic', maxCount: 1 }]), userInfoControllers.createUserInfo)
userInfoRouter.patch("/:userId", authenticate,userInfoControllers.updateUserInfo)
userInfoRouter.delete("/:userId", authenticate,userInfoControllers.deleteUserInfo)
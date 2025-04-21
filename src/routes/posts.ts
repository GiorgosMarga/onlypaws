import { Router } from "express";
import postsControllers from "../controllers/posts"
import authorize from "../middlewares/authorize";
import authenticate from "../middlewares/authenticate";
import multer from "multer"
import isLoggedIn from "../middlewares/isLoggedIn";

const storage = multer.memoryStorage()
const upload = multer({ storage: storage, limits: {fileSize: 1024*1024*101,fieldSize: 1024 * 1024 * 101 } })


export const postsRouter = Router()



postsRouter.get("/",isLoggedIn, postsControllers.getPosts)
postsRouter.get("/user/:userId",postsControllers.getPostsForUser)
postsRouter.get("/:postId",postsControllers.getPost)
postsRouter.patch("/:postId", authenticate,authorize,postsControllers.updatePost)
postsRouter.delete("/:postId",authenticate,authorize, postsControllers.deletePost)
postsRouter.post("/",authenticate,upload.single("media"), postsControllers.createPost)
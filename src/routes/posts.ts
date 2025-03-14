import { Router } from "express";
import postsControllers from "../controllers/posts"
import authorize from "../middlewares/authorize";
import authenticate from "../middlewares/authenticate";

export const postsRouter = Router()

postsRouter.get("/",postsControllers.getPosts)
postsRouter.get("/:postId",postsControllers.getPost)
postsRouter.patch("/:postId", authenticate,authorize,postsControllers.updatePost)
postsRouter.delete("/:postId",authenticate,authorize, postsControllers.deletePost)
postsRouter.post("/",authenticate, postsControllers.createPost)
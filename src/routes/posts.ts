import { Router } from "express";
import postsControllers from "../controllers/posts"
import authorize from "../middlewares/authorize";
import authenticate from "../middlewares/authenticate";

export const postsRouter = Router()

postsRouter.get("/",postsControllers.getPosts)
postsRouter.get("/:id",postsControllers.getPost)
postsRouter.patch("/:id", authenticate,authorize,postsControllers.updatePost)
postsRouter.delete("/:id",authenticate,authorize, postsControllers.deletePost)
postsRouter.post("/",authenticate, postsControllers.createPost)
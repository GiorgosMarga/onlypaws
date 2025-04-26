import { Router } from "express";
import postLikesControllers from "../controllers/postLikes";
import authenticate from "../middlewares/authenticate";
export const postLikesRouter = Router()

postLikesRouter.post("/:postId",authenticate, postLikesControllers.likePost)
postLikesRouter.delete("/:postId",authenticate,postLikesControllers.removeLikePost)
postLikesRouter.get("/",authenticate, postLikesControllers.getLikedPosts)
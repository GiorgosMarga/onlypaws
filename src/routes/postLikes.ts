import { Router } from "express";
import postLikesControllers from "../controllers/postLikes";
export const postLikesRouter = Router()

postLikesRouter.post("/:id",postLikesControllers.likePost)
postLikesRouter.delete("/:id",postLikesControllers.removeLikePost)
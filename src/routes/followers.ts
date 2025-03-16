import { Router } from "express";
import { followersControllers } from "../controllers/followers";
import authenticate from "../middlewares/authenticate";

export const followersRouter = Router()

followersRouter.get("/followers/:userId",authenticate, followersControllers.getFollowers)
followersRouter.get("/followings/:userId",authenticate, followersControllers.getFollowings)
followersRouter.post("/:userId",authenticate, followersControllers.follow)
followersRouter.delete("/:userId",authenticate, followersControllers.unfollow)
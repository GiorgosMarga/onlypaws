import { Router } from "express";
import { followersControllers } from "../controllers/followers";
import authenticate from "../middlewares/authenticate";

export const followersRouter = Router()

followersRouter.use(authenticate)
followersRouter.get("/followers/:userId", followersControllers.getFollowers)
followersRouter.get("/followings/:userId", followersControllers.getFollowings)
followersRouter.get("/is-following/:userId",authenticate, followersControllers.isFollowing)
followersRouter.post("/", followersControllers.follow)
followersRouter.delete("/:userId", followersControllers.unfollow)
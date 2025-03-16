import { StatusCodes } from "http-status-codes"
import errors from "../errors"
import { AuthenticatedReq } from "../middlewares/authorize"
import followersService from "../services/followers"
import { uuidSchema } from "../validators/uuid"
import { Response } from "express"


const getFollowers = async (req: AuthenticatedReq, res: Response) => {
    const userId = req.params["userId"] as string

    const {error: validationError} = uuidSchema.validate(userId)

    if(validationError) {
        throw new errors.BadRequestError({message: `Invalid id: ${userId}`})
    }

    const followers = await followersService.getFollowers(userId)
    res.status(StatusCodes.OK).json({followers})
}


const getFollowings = async (req: AuthenticatedReq, res: Response) => {
    const userId = req.params["userId"] as string
    const {error: validationError} = uuidSchema.validate(userId)

    if(validationError) {
        throw new errors.BadRequestError({message: `Invalid id: ${userId}`})
    }

    const followings = await followersService.getFollowing(userId)
    res.status(StatusCodes.OK).json({followings})
}

const follow = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!
    const userToFollow = req.params["userId"] as string

    // You should not be able to follow urself
    if (user.id === userToFollow) {
        throw new errors.BadRequestError({message: "You cannot follow urself."})
    }
    

    const {error: validationError} = uuidSchema.validate(userToFollow)
    if(validationError) {
        throw new errors.BadRequestError({message: `Invalid id: ${userToFollow}`})
    }   

    const isOk = await followersService.followUser(user.id,userToFollow)
    if(!isOk) {
        throw new errors.BadRequestError({message: `User: ${user.id} could not follow user: ${userToFollow}`})
    }

    res.status(StatusCodes.OK).json({"message": "Success"})
}

const unfollow = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!
    const userToUnfollow = req.params["userId"] as string
    const {error: validationError} = uuidSchema.validate(userToUnfollow)
    if(validationError) {
        throw new errors.BadRequestError({message: `Invalid id: ${userToUnfollow}`})
    }   

    const isOk = await followersService.removeFollow(user.id,userToUnfollow)
    if(!isOk) {
        throw new errors.BadRequestError({message: `User: ${user.id} could not unfollow user: ${userToUnfollow}`})
    }

    res.status(StatusCodes.OK).json({"message": "Success"})
}
export const followersControllers = {
    getFollowers,
    getFollowings,
    follow,
    unfollow
}
import {Router} from "express"
import {commentsControllers} from "../controllers/comments"
import authenticate from "../middlewares/authenticate"

export const commentsRouter  = Router()

commentsRouter.post("/respond/:commentId",authenticate, commentsControllers.responseComment)
commentsRouter.get("/:postId", commentsControllers.getComments)
commentsRouter.patch("/:commentId",authenticate, commentsControllers.updateComment)
commentsRouter.delete("/:commentId",authenticate, commentsControllers.deleteComment)
commentsRouter.post("/",authenticate, commentsControllers.createComment)
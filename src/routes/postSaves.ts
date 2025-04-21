import {Router} from "express";
import authenticate from "../middlewares/authenticate";
import postSavesControllers from "../controllers/postSaves";
const postSavesRouter = Router()

postSavesRouter.post("/:postId",authenticate, postSavesControllers.savePost) 
postSavesRouter.delete("/:postId",authenticate, postSavesControllers.removeSavePost) 
postSavesRouter.get("/",authenticate, postSavesControllers.getSavedPosts)

export default postSavesRouter  
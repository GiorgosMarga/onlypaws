import { Router } from "express";
import authenticate from "../middlewares/authenticate";
import conversationsControllers from "../controllers/conversations";
const convRouter = Router()

convRouter.get("/", authenticate, conversationsControllers.getAllConversations)
convRouter.post("/", authenticate, conversationsControllers.createConversation)
convRouter.get("/messages/:convId", authenticate, conversationsControllers.getConversationMessages)

export {
    convRouter,
}
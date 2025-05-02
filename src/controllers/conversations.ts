import { Response } from "express";
import { AuthenticatedReq } from "../middlewares/authorize";
import conversationsService from "../services/conversations";
import { StatusCodes } from "http-status-codes";
import errors from "../errors";
import { uuidSchema } from "../validators/uuid";
import ParseValidationErrors from "../utils/parseValidationError";

const getAllConversations = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!

    const conversations = await conversationsService.getAllConversations(user.id)

    res.status(StatusCodes.OK).json({
        conversations
    })
}

const createConversation = async (req: AuthenticatedReq, res:Response) => {
    const user = req.user!
    const userId = req.body["userId"]

    const {error: validationError} = uuidSchema.validate(userId)
    if(validationError){
        throw new errors.BadRequestError({message: ParseValidationErrors(validationError)})
    }

    const newConversationId = await conversationsService.createConversation(user.id,userId)
    if(!newConversationId) {
        throw new errors.InternalServerError({message: "Error creating conversation"})
    }

    res.status(StatusCodes.OK).json({convId: newConversationId})
}


const getConversationMessages = async (req: AuthenticatedReq, res: Response) => {

    const user = req.user!

    const conversationId = req.params["convId"] as string

    let page = Number(req.query["page"]) 
    if(!page || isNaN(page)){
        page = 1
    }
    let limit = Number(req.query["limit"])
    if(!limit || isNaN(limit)){
        limit = 20
    }

    const {error: validationError} = uuidSchema.validate(conversationId)
    if(validationError) {
        throw new errors.BadRequestError({message: ParseValidationErrors(validationError)})
    }

    const messages = await conversationsService.getConversationMessages(user.id,conversationId,limit,page)

    res.status(StatusCodes.OK).json({messages})
    
}

const getConversation = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!

    const convId = req.params["convId"]

    const {error: validationError} = uuidSchema.validate(convId)
    if(validationError){
        throw new errors.BadRequestError({message: ParseValidationErrors(validationError)})
    }

    const conv = await conversationsService.getConversation(convId)

    if(!conv) {
        throw new errors.NotFoundError({message: `Conversation with id: ${convId} doesn't exist.`})
    }

    if(conv.user1 !== user.id && conv.user2 !== user.id) {
        // this conversation doesnt belong to the user
        throw new errors.NotFoundError({message: `Conversation with id: ${convId} doesn't exist.`})
    }

    res.status(StatusCodes.OK).json({conv})
}
export default {
    getAllConversations,
    createConversation,
    getConversationMessages,
    getConversation
}
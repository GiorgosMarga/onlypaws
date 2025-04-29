import { Response } from "express";
import { AuthenticatedReq } from "../middlewares/authorize";
import conversationsService from "../services/conversations";
import { StatusCodes } from "http-status-codes";
import errors from "../errors";

const getAllConversations = async (req: AuthenticatedReq, res: Response) => {
    const user = req.user!

    const conversations = await conversationsService.getAllConversations(user.id)

    res.status(StatusCodes.OK).json({
        conversations
    })
}

const createConversation = async (req: AuthenticatedReq, res:Response) => {
    const user = req.user!
    console.log(req.body)
    const {userId} = req.body
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
    // TODO: validate uuid

    const messages = await conversationsService.getConversationMessages(user.id,conversationId,limit,page)

    res.status(StatusCodes.OK).json({messages})
    
}
export default {
    getAllConversations,
    createConversation,
    getConversationMessages
}
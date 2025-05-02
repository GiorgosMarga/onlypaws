import { db } from "../db"
import { messagesTable } from "../db/schema/messages"
import { createMessage } from "../validators/messages"
import { type Message } from "../models/messages.model"
import conversationsService from "./conversations"
import ParseValidationErrors from "../utils/parseValidationError"
const insertMessage = async (message: any) => {
    const parsedMessage = message as Message

    // validate parsedMessage
    const {error: validationError} = createMessage.validate(parsedMessage)

    if(validationError) {
        console.log(ParseValidationErrors(validationError))
        return null
    }

    // check if conversation exists
    const convId = await conversationsService.conversationExists(parsedMessage.from,parsedMessage.to)



    if(!convId){
        // conversation doesnt exist
        // create conversation
        const createdConversationId = await conversationsService.createConversation(parsedMessage.from, parsedMessage.to)

        if(!createdConversationId){
            // there was an error creating the new conversation
            return null
        }
        parsedMessage.conversationId = createdConversationId
    }else{
        parsedMessage.conversationId = convId
    }

    const res = await db.insert(messagesTable).values({
        ...parsedMessage,
        createdAt: new Date()
    }).returning()
    return res.length > 0 ? res[0] : null
}


export default {
    insertMessage
}
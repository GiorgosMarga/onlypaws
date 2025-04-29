import Joi from "joi";

export const createMessage = Joi.object({
    content: Joi.string().required().max(1000).min(1),
    from: Joi.string().required().uuid(),
    to: Joi.string().uuid().required(),
    conversation: Joi.string().uuid().allow(null),
    createdAt: Joi.date().allow(null)
}).required().min(1).label("body")


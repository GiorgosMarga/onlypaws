import Joi from "joi";

const createPostSchema = Joi.object({
    mediaUrl: Joi.array().required().max(10).min(1),
    tags: Joi.array().max(10),
    description: Joi.string()
}).required().label("body")

const updatePostSchema = Joi.object().keys({
    mediaUrl: Joi.array().max(10).min(1),
    tags: Joi.array().max(10),
  description: Joi.string()
}).required().min(1).label("body")
export default {
    createPostSchema,
    updatePostSchema
}
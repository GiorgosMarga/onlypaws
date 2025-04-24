import Joi from "joi";

const createComment = Joi.object({
    content: Joi.string().required().max(1000).min(1),
    postId: Joi.string().required().uuid(),
    parentId: Joi.string().uuid().allow(null),
    mainCommentId: Joi.string().uuid().allow(null),
}).required().min(1).label("body")

const updateComment = Joi.object({
    content: Joi.string().required().max(1000).min(1),
}).required().min(1).label("body")

export const commentsValidator = {
    createComment,
    updateComment
}
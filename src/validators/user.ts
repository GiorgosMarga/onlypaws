import Joi from "joi"

const userSchema = Joi.object({
    username: Joi.string().required().min(3).max(255),
    email: Joi.string().required().email(), 
    password: Joi.string().required().min(7).max(255), 
})
const userUpdateSchema = Joi.object({
    username: Joi.string().min(3).max(255),
    email: Joi.string().email(), 
    password: Joi.string().min(7).max(255), 
})

const userLoginSchema = Joi.object({
    email: Joi.string().email().required(), 
    password: Joi.string().min(7).max(255).required(), 
})

const otpSchema = Joi.object({
    otp: Joi.number().min(10_000).max(99_999).required()
})
const emailSchema = Joi.object({
    email: Joi.string().email().required()
})

const passwordSchema = Joi.object({
    password: Joi.string().min(7).max(255).required()
})

const googleCodeSchema = Joi.object({
    code: Joi.string().required(),
    scope: Joi.string(),
    authuser: Joi.string(),
    prompt: Joi.string()
})

export default  {
    googleCodeSchema,
    passwordSchema,
    emailSchema,
    otpSchema,
    userSchema,
    userUpdateSchema,
    userLoginSchema
}
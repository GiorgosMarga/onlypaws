import Joi from "joi"

export const userSchema = Joi.object({
    username: Joi.string().required().min(3).max(255),
    email: Joi.string().required().email(), 
    password: Joi.string().required().min(7).max(255), 
})


export const userUpdateSchema = Joi.object({
    username: Joi.string().min(3).max(255),
    email: Joi.string().email(), 
    password: Joi.string().min(7).max(255), 
})

export const userLoginSchema = Joi.object({
    email: Joi.string().email().required(), 
    password: Joi.string().min(7).max(255).required(), 
})

export const otpSchema = Joi.object({
    otp: Joi.number().min(10_000).max(99_999).required()
})

export const emailSchema = Joi.object({
    email: Joi.string().email().required()
})

export const passwordSchema = Joi.object({
    password: Joi.string().min(7).max(255).required()
})
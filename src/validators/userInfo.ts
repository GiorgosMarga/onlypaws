import Joi from "joi";


const MINIMUM_AGE = 13;
const minDOB = new Date();
minDOB.setFullYear(minDOB.getFullYear() - MINIMUM_AGE);

const userInfoUpdateSchema = Joi.object({
    bio: Joi.string().min(3).max(500),
    dogName: Joi.string().min(3).max(50),
    dogAge: Joi.number(),
    dogBreed: Joi.string().min(3).max(255),
    birthDate: Joi.date().less(minDOB)
}).required().min(1).message("User info update body cant be empty")

const userInfoInsertSchema = Joi.object({
    bio: Joi.string().min(3).max(500).required(),
    dogName: Joi.string().min(3).max(50).required(),
    dogAge: Joi.number().required(),
    dogBreed: Joi.string().min(3).max(255).required(),
    birthDate: Joi.date().less(minDOB).required()
}).required()

export default {
    userInfoUpdateSchema,
    userInfoInsertSchema
}
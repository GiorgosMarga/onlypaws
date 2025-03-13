import Joi from "joi";

export default function parseJoiErrors(err: Joi.ValidationError) {
    return err.details.map((detail) => detail.message).join(",")
}
import Joi from "joi"

export default function ParseValidationErrors(joiErrors: Joi.ValidationError) {
    console.log("Joi Errors", joiErrors)
    const details = joiErrors.details
    const errors: { [key: string]: string } = {}
    details.forEach((detail) => {
        const key = detail.path.join(".")
        const message = detail.message.split(' ').slice(1).join(' ')
        if (errors[key]) {
            errors[key] += `, ${message}`
        } else {
            errors[key] = message
        }
    })
    return errors
}
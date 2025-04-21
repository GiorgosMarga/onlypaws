import ApiError from "./ApiError";
import { StatusCodes } from "http-status-codes";
export default class BadRequestError extends ApiError {
    constructor({message}:{message: any}){
        super({message, statusCode: StatusCodes.BAD_REQUEST})
    }
}
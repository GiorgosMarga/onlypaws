import { StatusCodes } from "http-status-codes";
import ApiError from "./ApiError";

export default class ValidationError extends ApiError {
    constructor({message}:{message:any}){
        super({message, statusCode: StatusCodes.UNPROCESSABLE_ENTITY})
    }
    
}
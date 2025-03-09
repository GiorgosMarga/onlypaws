import { StatusCodes } from "http-status-codes";
import ApiError from "./ApiError";

export default class InternalServerError extends ApiError{
    constructor({message}:{message:string}){
        super({message, statusCode: StatusCodes.INTERNAL_SERVER_ERROR})
    }
}
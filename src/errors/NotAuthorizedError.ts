import { StatusCodes } from "http-status-codes";
import ApiError from "./ApiError";

export default class NotAuthorizedError extends ApiError {
    constructor({message}:{message:string}){
        super({message, statusCode: StatusCodes.UNAUTHORIZED})
    }
}
export default class ApiError extends Error {
    message: any;
    statusCode: number;

    constructor({
        message,
        statusCode,
    }: {
        message: any,
        statusCode: number
    }) {
        super()
        this.message = message
        this.statusCode = statusCode
    }

}
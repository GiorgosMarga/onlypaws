import express, {type Express,type Request,type Response} from "express";
import { userRouter } from "./routes/users";
import dotenv from "dotenv"
import errorHandler from "./middlewares/error";
import cookieParser from "cookie-parser"
import { tokenRouter } from "./routes/tokens";
import { StatusCodes } from "http-status-codes";
import InternalServerError from "./errors/InternalServerError";
import { fetchUserByEmail, insertUser } from "./services/user";
import BadRequestError from "./errors/BadRequestError";
dotenv.config()

const app: Express = express()

app.use(express.json())
app.use(cookieParser()) 
app.use("/api/v1/users",userRouter)
app.use("/api/v1/tokens",tokenRouter)
app.use(errorHandler)



app.listen(process.env.PORT, () => console.log(`Server is running at :${process.env.PORT}`))
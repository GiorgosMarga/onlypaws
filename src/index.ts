import express, {Express} from "express";
import { userRouter } from "./routes/users";
import dotenv from "dotenv"
import errorHandler from "./middlewares/error";
import cookieParser from "cookie-parser"
import { tokenRouter } from "./routes/tokens";
dotenv.config()

const app: Express = express()

app.use(express.json())
app.use(cookieParser())
app.use("/api/v1/users",userRouter)
app.use("/api/v1/refresh-token",tokenRouter)
app.use(errorHandler)



app.listen(process.env.PORT, () => console.log(`Server is running at :${process.env.PORT}`))
import express, {type Express} from "express";
import { userRouter } from "./routes/users";
import { userInfoRouter } from "./routes/userInfo";
import dotenv from "dotenv"
import errorHandler from "./middlewares/error";
import cookieParser from "cookie-parser"
import { tokenRouter } from "./routes/tokens";
import { pool } from "./db";
import { postsRouter } from "./routes/posts";
import morgan from "morgan"
import { postLikesRouter } from "./routes/postLikes";
import { followersRouter } from "./routes/followers";
import { commentsRouter } from "./routes/comments";
import notFound from "./middlewares/notFound"
dotenv.config()
import cors from "cors"

export const app: Express = express()


app.use(morgan("dev"))
app.use(cors({
  origin: "http://localhost:3000", // Allow frontend origin
  credentials: true, // Allow cookies & authentication headers
}));
app.use(express.json({limit: 1024*1024*100}))
app.use(express.urlencoded({limit: 1024*1024*100, extended: true}))
app.use(cookieParser()) 
app.use("/api/v1/users",userRouter)
app.use("/api/v1/likes", postLikesRouter)
app.use("/api/v1/posts",postsRouter)
app.use("/api/v1/tokens",tokenRouter)
app.use("/api/v1/user-info",userInfoRouter)
app.use("/api/v1/follows",followersRouter)
app.use("/api/v1/comments",commentsRouter)
app.use(notFound)
app.use(errorHandler)

const server = app.listen(process.env.PORT, () => console.log(`Server is running at :${process.env.PORT}`))

process.on("SIGTERM", () => {
    console.log("Received SIGTERM")
    server.close(async () => {
        try{
            await pool.end()
            console.log("Successfully disconnected from db")
        }catch (err) {
            console.log("Error disconnecting from db: ",err)
        }
        console.log("Terminating server")
        process.exit(0)
    })
})
process.on("SIGINT", () => {
    console.log("Received SIGINT")
    server.close(async () => {
        try{
            await pool.end()
            console.log("Successfully disconnected from db")
        }catch (err) {
            console.log("Error disconnecting from db: ",err)
        }
        console.log("Terminating server")
        process.exit(0)
    })
})
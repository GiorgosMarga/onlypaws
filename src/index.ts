dotenv.config()
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
import postSavesRouter from "./routes/postSaves"
import notFound from "./middlewares/notFound"
import cors from "cors"

const app: Express = express()
 

app.use(morgan("dev"))
app.use(cors({
  origin: process.env.FRONTEND_URL, // Allow frontend origin
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
app.use("/api/v1/save",postSavesRouter)
app.use(notFound)
app.use(errorHandler)

const server = app.listen(process.env.PORT, () => console.log(`Server is running at :${process.env.PORT}`))



const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}`);
  server.close(async () => {
    try {
      await pool.end();
      console.log("Successfully disconnected from db");
    } catch (err) {
      console.error("Error disconnecting from db:", err);
    }
    console.log("Terminating server");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () =>  gracefulShutdown("SIGINT"))
process.on("uncaughtException", (reason) => {
    console.error(reason)
    gracefulShutdown("")
})
process.on("unhandledRejection", (reason) => {
    console.error(reason)
    gracefulShutdown("")
})
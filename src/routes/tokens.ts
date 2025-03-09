import { Router } from "express";
import { refreshToken } from "../controllers/tokens";

export const tokenRouter = Router()


tokenRouter.get("/", refreshToken)


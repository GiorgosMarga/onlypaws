import { Router } from "express";
import { refreshToken, revokeToken } from "../controllers/tokens";

export const tokenRouter = Router()


tokenRouter.get("/refresh", refreshToken)
tokenRouter.patch("/:id", revokeToken)


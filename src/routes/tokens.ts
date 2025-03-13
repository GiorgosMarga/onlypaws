import { Router } from "express";
import { refreshToken, revokeToken } from "../controllers/tokens";
import authorize from "../middlewares/authorize";
import authenticate from "../middlewares/authenticate";

export const tokenRouter = Router()


tokenRouter.get("/refresh", refreshToken)
tokenRouter.patch("/:id",authenticate,authorize, revokeToken)
tokenRouter.patch("/user/:id",authenticate,authorize, revokeToken)


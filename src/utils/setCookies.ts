import { Response } from "express";
import convertToMs from "./convertToMs";
import "dotenv/config"

export default function setCookies(res: Response,accessToken: string, refreshToken: string ){

    const secure = process.env.NODE_ENV === "production" ? true : false 
    const sameSite = process.env.NODE_ENV === "production" ? "none" : "lax" 
    res.cookie('access_token',accessToken, { maxAge: convertToMs(15,"min") , httpOnly: true, sameSite, secure }); 
    res.cookie('refresh_token',refreshToken, { maxAge: convertToMs(7,"d") , httpOnly: true, sameSite, secure });
}
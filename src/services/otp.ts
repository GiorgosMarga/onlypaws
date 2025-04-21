import { and, eq, gt } from "drizzle-orm";
import { db } from "../db";
import { otpsTable } from "../db/schema/otps";
import { OTP, OTPInsert } from "../models/otp.model";

async function insertOTP (otp: OTPInsert){
    const newOtp = await db.insert(otpsTable).values(otp).returning({otp: otpsTable.otp})
    return newOtp.length === 0 ? null:  newOtp[0]
}
async function deleteOTP(otpCode: number, userId: string, currentTimestamp?: Date ) {
    let fetchedOTP: OTP[];
    if(!currentTimestamp) {
        fetchedOTP = await db.delete(otpsTable).where(and(eq(otpsTable.userId, userId),eq(otpsTable.otp,otpCode))).returning()
    }else{
        // used to verify the user
        fetchedOTP = await db.delete(otpsTable).where(and(eq(otpsTable.userId, userId),eq(otpsTable.otp,otpCode), gt(otpsTable.expiresAt, currentTimestamp))).returning()
    }

    return fetchedOTP.length == 0 ? null : fetchedOTP
}

export default {
    insertOTP,
    deleteOTP
}
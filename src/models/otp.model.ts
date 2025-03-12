import { otpsTable } from "../db/schema/otps"

export type OTPInsert = typeof otpsTable.$inferInsert  
export type OTP = typeof otpsTable.$inferSelect  

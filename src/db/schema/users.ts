import { uuid, varchar, timestamp, uniqueIndex, pgSchema, date, boolean, real } from "drizzle-orm/pg-core";

export const schema = pgSchema("onlypaws")
export const userRole = schema.enum("userRole", ["USER","ADMIN"]) 
export const usersTable = schema.table("users", {
    id: uuid().primaryKey().defaultRandom(),
    username: varchar({length:255}).notNull(),
    email:varchar({ length: 255 }).notNull(),
    password: varchar({length:256}).notNull(),
    role: userRole("role").notNull().default("USER"),
    profilePic: varchar("profile_pic",{length:255}),
    birthDate: date("birth_date"),
    lastLogin: date("last_login"),
    isBanned: boolean("is_banned").default(false),
    isVerified: boolean("is_verified").default(false),
    otp: real(),
    otpExpiresAt: timestamp("otp_expires_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, table => [
        uniqueIndex("emailIndex").on(table.email)
    ]
)
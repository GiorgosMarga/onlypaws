import { uuid, varchar, timestamp, uniqueIndex, pgSchema, date, boolean } from "drizzle-orm/pg-core";

export const schema = pgSchema("onlypaws")
export const userRole = schema.enum("userRole", ["USER","ADMIN"]) 
export const usersTable = schema.table("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    google_id: varchar("google_id").unique(),
    github_id: varchar("github_id").unique(),
    username: varchar("username",{length:255}).notNull(),
    email:varchar("email",{ length: 255 }).notNull(),
    password: varchar("password",{length:256}), // can be null in case of 3rd party auth
    role: userRole("role").notNull().default("USER"),
    profilePic: varchar("profile_pic",{length:255}),
    lastLogin: date("last_login"),
    isBanned: boolean("is_banned").notNull().default(false),
    isVerified: boolean("is_verified").notNull().default(false),
    hasFinishedProfile: boolean("has_finished_profile").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
}, table => [
        uniqueIndex("emailIndex").on(table.email)
    ]
)
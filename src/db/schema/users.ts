import { uuid, varchar, timestamp, uniqueIndex, pgSchema, date, boolean } from "drizzle-orm/pg-core";

export const schema = pgSchema("onlypaws")
export const userRole = schema.enum("userRole", ["USER","ADMIN"]) 
export const usersTable = schema.table("users", {
    id: uuid().primaryKey().defaultRandom(),
    google_id: varchar("google_id").unique(),
    username: varchar({length:255}).notNull(),
    email:varchar({ length: 255 }).notNull(),
    password: varchar({length:256}), // can be null in case of google auth
    role: userRole("role").notNull().default("USER"),
    profilePic: varchar("profile_pic",{length:255}),// TODO: move these to new table profilePic and birthdate + other information about the user
    birthDate: date("birth_date"),
    lastLogin: date("last_login"),
    isBanned: boolean("is_banned").default(false),
    isVerified: boolean("is_verified").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
}, table => [
        uniqueIndex("emailIndex").on(table.email)
    ]
)
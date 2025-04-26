import { integer, primaryKey, text, timestamp, uniqueIndex, uuid,varchar } from "drizzle-orm/pg-core";
import { schema, usersTable } from "./users";
import { sql } from "drizzle-orm";

export const userInfoTable = schema.table("user_info", {
    userId: uuid("user_id").references(() => usersTable.id, {onDelete: "cascade"}).notNull().primaryKey(),
    birthDate: timestamp("birth_date").notNull().default(sql`CURRENT_TIMESTAMP`),
    bio: text("bio"),
    dogName: varchar("dog_name", {length: 255}).notNull().default("Unknown"),
    name: varchar("name", {length: 255}).notNull(),
    dogAge: integer("dog_age"),
    dogBreed: varchar("dog_breed",{length:255}),
    userAvatar: varchar("user_avatar"),
    dogAvatar: varchar("dog_avatar"),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date())
},table => [
        uniqueIndex("user_id").on(table.userId)
])
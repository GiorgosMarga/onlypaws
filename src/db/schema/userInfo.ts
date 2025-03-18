import { integer, primaryKey, text, timestamp, uuid,varchar } from "drizzle-orm/pg-core";
import { schema, usersTable } from "./users";

export const userInfoTable = schema.table("user_info", {
    userId: uuid().references(() => usersTable.id, {onDelete: "cascade"}).notNull().primaryKey(),
    birthDate: timestamp("birth_date").notNull(),
    bio: text(),
    dogName: varchar("dog_name", {length: 255}).notNull(),
    dogAge: integer("dog_age"),
    dogBreed: varchar("dog_breed",{length:255}),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date())
})
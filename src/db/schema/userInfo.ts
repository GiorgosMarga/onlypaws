import { primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { schema, usersTable } from "./users";

// TODO: add more here
export const userInfoTable = schema.table("user_info", {
    id: uuid().defaultRandom(),
    userId: uuid().references(() => usersTable.id).notNull(),
    birthDate: timestamp("birth_date").notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date())
}, (table) => [
    primaryKey({columns: [table.id, table.userId]})
])
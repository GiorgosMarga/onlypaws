import { timestamp, uuid } from "drizzle-orm/pg-core";
import { schema, usersTable } from "./users";

export const conversationsTable = schema.table("conversations", {
    id: uuid().defaultRandom().primaryKey(),
    user1: uuid("user_1").references(() => usersTable.id).notNull(),
    user2: uuid("user_2").references(() => usersTable.id).notNull(),
    createdAt: timestamp("created_at").defaultNow()
})
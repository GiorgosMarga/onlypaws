import { timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { schema, usersTable } from "./users";
import { conversationsTable } from "./conversations";

export const messagesTable = schema.table("messages",{
    id: uuid().defaultRandom().primaryKey(),
    from: uuid().references(() => usersTable.id).notNull(),
    to: uuid().references(() => usersTable.id).notNull(), 
    conversationId: uuid("conversation_id").references(() => conversationsTable.id).notNull(),
    content: varchar().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    readAt: timestamp("read_at"),
})
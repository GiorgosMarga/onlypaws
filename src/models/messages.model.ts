import { messagesTable } from "../db/schema/messages";

export type Message = typeof messagesTable.$inferInsert  
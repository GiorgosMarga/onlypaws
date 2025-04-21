import { varchar,uuid,timestamp,primaryKey } from "drizzle-orm/pg-core";
import { schema, usersTable } from "./users";
import { sql } from "drizzle-orm";

export const passwordTokensTable = schema.table("password_tokens",{
    token: varchar({length:32}).notNull(),
    userId: uuid("user_id").references(() => usersTable.id, {onDelete: "cascade"}).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    expiresAt: timestamp("expires_at").notNull().default(sql`NOW() + INTERVAL '5 minutes'`)
}, table => [
    primaryKey({columns: [table.userId,table.token]})
])
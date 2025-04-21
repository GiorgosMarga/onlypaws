import { boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { schema, usersTable } from "./users";


export const refreshTokenTable = schema.table("refresh_tokens",{
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
    isRevoked: boolean("is_revoked").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    expiresAt: timestamp("expires_at").notNull()
})

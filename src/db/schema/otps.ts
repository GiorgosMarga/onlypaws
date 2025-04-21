import { uuid, timestamp, real, primaryKey } from "drizzle-orm/pg-core";
import { schema, usersTable } from "./users";

export const otpsTable = schema.table("otps", {
    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
    otp: real(),
    createdAt: timestamp("created_at").defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
}, table => [
        primaryKey({ columns: [table.otp, table.userId] }),
    ]
)
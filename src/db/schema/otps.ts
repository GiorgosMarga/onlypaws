import { uuid, varchar, timestamp, uniqueIndex, pgSchema, date, boolean, real, primaryKey } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const schema = pgSchema("onlypaws")
export const otpsTable = schema.table("otps", {
    userId: uuid().references(() => usersTable.id),
    otp: real(),
    createdAt: timestamp("created_at").defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
}, table => [
        primaryKey({ columns: [table.otp, table.userId] }),
    ]
)
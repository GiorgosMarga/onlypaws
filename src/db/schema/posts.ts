import { uuid ,varchar, text, timestamp} from "drizzle-orm/pg-core";
import { schema, usersTable } from "./users";

export const postsTable = schema.table("posts", {
    id: uuid().primaryKey().notNull().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => usersTable.id),
    tags: varchar({ length: 255 }).array().default([]),
    description: text(),
    mediaUrl: text().array().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
})
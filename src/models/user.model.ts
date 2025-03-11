import { usersTable } from "../db/schema/users";

export type UserInsert = typeof usersTable.$inferInsert
export type User = typeof usersTable.$inferSelect
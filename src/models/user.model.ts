import { usersTable } from "../db/schema/users";

export type User = typeof usersTable.$inferSelect
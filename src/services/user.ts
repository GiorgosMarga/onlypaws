import { eq } from "drizzle-orm"
import { db } from "../db"
import { usersTable } from "../db/schema/users"

export const fetchUserByEmail = async (email: string) => {
    const user = await db.select().from(usersTable).where(eq(usersTable.email,email))
    return user.length === 0 ? null : user[0]
}

export const fetchUserById = async (id: string) => {
    const user = await db.select().from(usersTable).where(eq(usersTable.id,id))
    return user.length === 0 ? null : user[0]
}
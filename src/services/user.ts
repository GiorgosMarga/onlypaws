import { and, count, eq, gt } from "drizzle-orm"
import { db } from "../db"
import { usersTable } from "../db/schema/users"
import { calculateOffset } from "../utils/calculateOffset"
import { User } from "../models/user.model"
import { passwordTokensTable } from "../db/schema/passwordTokens"

export const fetchUserByEmail = async (email: string) => {
    const user = await db.select().from(usersTable).where(eq(usersTable.email,email))
    return user.length === 0 ? null : user[0]
}

export const fetchUserById = async (id: string) => {
    const user = await db.select().from(usersTable).where(eq(usersTable.id,id))
    return user.length === 0 ? null : user[0]
}

export const fetchUsers = async ({page=1,limit=10}:{page:number, limit:number}) => {
    const users = await db.select().from(usersTable).offset(calculateOffset(page,limit)).limit(limit)
    return users
}

export const insertUser = async (user: User) => {
    const insertedUser = await db.insert(usersTable).values(user).returning()
    return insertedUser.length === 0 ? null : insertedUser[0]
}

export const updateUser = async (user: User) => {
    const updatedUser = await db.update(usersTable).set(user).where(eq(usersTable.id, user.id)).returning()
    return updatedUser.length === 0 ? null : updatedUser[0]
}

export const deleteUser = async (userId: string) => {
    const deletedUser = await db.delete(usersTable).where(eq(usersTable.id, userId)).returning()
    return deletedUser.length === 0 ? null : deletedUser[0]
}


export const insertPasswordResetToken = async (token: string, userId:string) => {
    const insertedToken = await db.insert(passwordTokensTable).values({token,userId}).returning()
    return insertedToken.length === 0 ? null : insertedToken[0]
}

export const fetchUserFromResetToken = async (token: string) => {

    const user = await db.select().from(passwordTokensTable).leftJoin(usersTable, eq(usersTable.id, passwordTokensTable.userId)).where(and(eq(passwordTokensTable.token,token),gt(passwordTokensTable.expiresAt, new Date())))


    return user.length === 0 ? null : user[0]
}

export const deleteResetToken = async (tokenId: string) => {
    await db.delete(passwordTokensTable).where(and(eq(passwordTokensTable.token,tokenId)))
}
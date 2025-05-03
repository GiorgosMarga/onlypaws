import { and, eq, gt } from "drizzle-orm"
import { db } from "../db"
import { usersTable } from "../db/schema/users"
import { calculateOffset } from "../utils/calculateOffset"
import {type User, type UserInsert } from "../models/user.model"
import { passwordTokensTable } from "../db/schema/passwordTokens"
import { userInfoTable } from "../db/schema/userInfo"

const fetchUserByEmail = async (email: string) => {
    const user = await db.select().from(usersTable).where(eq(usersTable.email,email))
    return user.length === 0 ? null : user[0]
}

const fetchUserById = async (id: string) => {
    const user = await db.select().from(usersTable).where(eq(usersTable.id,id))
    return user.length === 0 ? null : user[0]
}
const fetchUsers = async ({page=1,limit=10}:{page:number, limit:number}) => {
    const users = await db.select().from(usersTable).offset(calculateOffset(page,limit)).limit(limit)
    return users
}
const insertUser = async (user: UserInsert) => {
    const insertedUser = await db.transaction(async (tx) => {
        const newUser = await tx.insert(usersTable).values(user).returning()
        await tx.insert(userInfoTable).values({userId:newUser[0].id, name:user.username})
        return newUser
    })
    return insertedUser.length === 0 ? null : insertedUser[0]
}

const updateUser = async (user: User) => {
    user.updatedAt = new Date(Date.now())
    const updatedUser = await db.update(usersTable).set(user).where(eq(usersTable.id, user.id)).returning()
    return updatedUser.length === 0 ? null : updatedUser[0]
}

const deleteUser = async (userId: string) => {
    const deletedUser = await db.delete(usersTable).where(eq(usersTable.id, userId)).returning()
    return deletedUser.length === 0 ? null : deletedUser[0]
}

const verifyUser = async (userId: string) => {
    const verifiedUser = await db.update(usersTable).set({isVerified: true}).where(eq(usersTable.id,userId)).returning()
    return verifiedUser.length === 0 ? null : verifiedUser[0]
}
const insertPasswordResetToken = async (token: string, userId:string) => {
    const insertedToken = await db.insert(passwordTokensTable).values({token,userId}).returning()
    return insertedToken.length === 0 ? null : insertedToken[0]
}

const fetchUserFromResetToken = async (token: string) => {

    const user = await db.select().from(passwordTokensTable).leftJoin(usersTable, eq(usersTable.id, passwordTokensTable.userId)).where(and(eq(passwordTokensTable.token,token),gt(passwordTokensTable.expiresAt, new Date())))


    return user.length === 0 ? null : user[0]
}

const deleteResetToken = async (tokenId: string) => {
    await db.delete(passwordTokensTable).where(and(eq(passwordTokensTable.token,tokenId)))
}

export default {
    deleteResetToken,
    fetchUserFromResetToken,
    insertPasswordResetToken,
    deleteUser,
    updateUser,
    fetchUserByEmail,
    fetchUserById,
    insertUser,
    fetchUsers,
    verifyUser
}
import { eq } from "drizzle-orm"
import { db } from "../db"
import { userInfoTable } from "../db/schema/userInfo"
import type { UserInfo, UserInfoInsert } from "../models/userInfo.model"
const fetchUserInfo = async (userId: string) => {
    const fetcedUserInfo = await db.select().from(userInfoTable).where(eq(userInfoTable.userId, userId))
    return fetcedUserInfo.length === 0 ? null : fetcedUserInfo[0] 
}


const deleteUserInfo = async (userId: string) => {
    const deletedUserInfo = await db.delete(userInfoTable).where(eq(userInfoTable.userId, userId)).returning()
    return deletedUserInfo.length === 0 ? null : deletedUserInfo[0] 
}

const updateUserInfo = async (userInfo: UserInfo) => {
    const updatedUserInfo = await db.update(userInfoTable).set(userInfo).where(eq(userInfoTable.userId, userInfo.userId)).returning()
    return updatedUserInfo.length === 0 ? null : updatedUserInfo[0] 
}

const insertUserInfo = async (userInfo: UserInfoInsert) => {
    const insertedUserInfo = await db.insert(userInfoTable).values(userInfo).returning()
    return insertedUserInfo.length === 0 ? null : insertedUserInfo[0] 
}
export default {
    fetchUserInfo,
    deleteUserInfo,
    updateUserInfo,
    insertUserInfo
}
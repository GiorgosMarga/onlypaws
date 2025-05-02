import { eq, like, sql } from "drizzle-orm"
import { db } from "../db"
import { userInfoTable } from "../db/schema/userInfo"
import type { UserInfo, UserInfoInsert } from "../models/userInfo.model"
import { followersTable } from "../db/schema/follows"
import { usersTable } from "../db/schema/users"

const fetchUserInfoById = async (userId: string) => {
    const followersCountQuery = db
    .select({ count: sql<number>`COUNT(*)` })
    .from(followersTable)
    .where(eq(followersTable.followingUserId, userId));

  const followingCountQuery = db
    .select({ count: sql<number>`COUNT(*)` })
    .from(followersTable)
    .where(eq(followersTable.followerUserId, userId));

    const userInfoQuery = db
    .select({
        userId: userInfoTable.userId,
        name: userInfoTable.name,
        bio: userInfoTable.bio,
        dogAge: userInfoTable.dogAge,
        dogName: userInfoTable.dogName,
        dogBreed: userInfoTable.dogBreed, 
        userAvatar: userInfoTable.userAvatar,
        dogAvatar: userInfoTable.dogAvatar,
    })
    .from(userInfoTable)
    .where(eq(userInfoTable.userId, userId))

    const [followersCount,followingCount, userInfo] = await Promise.all([
        followersCountQuery,
        followingCountQuery,
        userInfoQuery
    ])

    return userInfo.length === 0 ? null : {
        ...userInfo[0],
        followers: followersCount[0]?.count ?? 0,
        following: followingCount[0]?.count ?? 0
    } 
}

const fetchUserInfoByUsername = async (username: string) => {
    const userInfoQuery = await db
    .select({
        userId: userInfoTable.userId,
        name: userInfoTable.name,
        dogName: userInfoTable.dogName,
        userAvatar: userInfoTable.userAvatar,
        dogAvatar: userInfoTable.dogAvatar,
    })
    .from(userInfoTable)
    .where(like(userInfoTable.name, `${username}%`))


    return userInfoQuery.length === 0 ? null : userInfoQuery
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
    const insertedUserInfo = await db.transaction(async (tx) => {
        const insertedUserInfo = await tx.insert(userInfoTable).values(userInfo).returning()
        await tx.update(usersTable).set({hasFinishedProfile: true}).where(eq(usersTable.id,userInfoTable.userId))
        return insertedUserInfo

    })
    return insertedUserInfo.length === 0 ? null : insertedUserInfo[0] 
}
export default {
    fetchUserInfoById,
    fetchUserInfoByUsername,
    deleteUserInfo,
    updateUserInfo,
    insertUserInfo
}
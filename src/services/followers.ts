import { and, eq } from "drizzle-orm"
import { db } from "../db"
import { followersTable } from "../db/schema/follows"
import { usersTable } from "../db/schema/users"

const getFollowers = async (userId: string) => {
    const followers = await db.select({userId: followersTable.followerUserId, username: usersTable.username}).from(followersTable).leftJoin(usersTable, eq(followersTable.followerUserId, usersTable.id)).where(eq(followersTable.followingUserId, userId))
    return followers
}

const getFollowing = async (userId: string) => {
    const followings = await db.select({userId: followersTable.followingUserId, username: usersTable.username}).from(followersTable).leftJoin(usersTable, eq(followersTable.followingUserId, usersTable.id)).where(eq(followersTable.followerUserId, userId))
    return followings
}



const followUser = async (followerId: string, followingId: string) => {
    const res = await db.insert(followersTable).values({followerUserId:followerId, followingUserId:followingId}).returning()
    return res[0] ?? null
}

const removeFollow = async (followerId: string, followingId: string) => {
    const res = await db.delete(followersTable).where(and(eq(followersTable.followerUserId,followerId),eq(followersTable.followingUserId, followingId))).returning()
    return res[0] ?? null
}

export default {
    followUser,
    removeFollow,
    getFollowers,
    getFollowing
}
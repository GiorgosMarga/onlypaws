import { and, eq, like } from "drizzle-orm"
import { db } from "../db"
import { postLikesTable } from "../db/schema/postLikes"

const likePost = async (userId: string, postId: string)  => {
    const likedPost = await db.insert(postLikesTable).values({postId,userId}).returning()
    return likedPost.length === 0 ? null : likedPost[0]
}


const removeLikePost = async (userId: string, postId: string)  => {
    const removedLike = await db.delete(postLikesTable).where(and(eq(postLikesTable.userId,userId), eq(postLikesTable.postId,postId))).returning()
    return removedLike.length === 0 ? null : removedLike[0]
}

export default {
    likePost,
    removeLikePost
}

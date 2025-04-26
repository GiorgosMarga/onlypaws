import { uuid ,varchar, text, timestamp, pgView, QueryBuilder} from "drizzle-orm/pg-core";
import { schema, usersTable } from "./users";
import { eq, sql } from "drizzle-orm";
import { postAnalyticsTable } from "./postAnalytics";
import { userInfoTable } from "./userInfo";
import { postLikesTable } from "./postLikes";
import { postSavesTable } from "./postSaves";
const qb = new QueryBuilder()

export const postsTable = schema.table("posts", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => usersTable.id,{ onDelete: "cascade" }),
    tags: varchar("tags",{ length: 255 }).array().default([]),
    description: text("description"),
    mediaUrl: text("media_url").array().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
})
export const postSelectionPublic = {
    likes: postAnalyticsTable.likes,
    id: postsTable.id,
    userId: postsTable.userId,
    tags: postsTable.tags,
    description: postsTable.description,
    mediaUrl: postsTable.mediaUrl,
    createdAt: postsTable.createdAt,
    comments: postAnalyticsTable.comments,
    views: postAnalyticsTable.views,
    dogName: userInfoTable.dogName,
    name: userInfoTable.name,
    userAvatar: userInfoTable.userAvatar,
    dogAvatar: userInfoTable.dogAvatar,
};

export const postsView = schema.view("posts_view").as(
    qb
    .select(postSelectionPublic)
    .from(postsTable)
    .leftJoin(userInfoTable, eq(userInfoTable.userId, postsTable.userId))
    .leftJoin(postAnalyticsTable, eq(postAnalyticsTable.postId, postsTable.id))
    .orderBy(sql`${postsTable.createdAt} desc`)
)

export const postSelectionPublicView = {
    likes: postsView.likes,
    id: postsView.id,
    userId: postsView.userId,
    tags: postsView.tags,
    description: postsView.description,
    mediaUrl: postsView.mediaUrl,
    created_at: postsView.createdAt,
    comments: postsView.comments,
    views: postsView.views,
    dogName: postsView.dogName,
    name: postsView.name,
    userAvatar: postsView.userAvatar,
    dogAvatar: postsView.dogAvatar,
}
export const postSelectionPrivateView = {
    ...postSelectionPublicView,
    isLiked: postLikesTable.userId,
    isSaved: postSavesTable.userId,
}
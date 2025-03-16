import { primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { schema, usersTable } from "./users";

export const followersTable = schema.table("followers", {
    followingUserId: uuid("following_user_id").notNull().references(() => usersTable.id, {"onDelete": "cascade"}),
    followerUserId: uuid("follower_user_id").notNull().references(() => usersTable.id,{"onDelete": "cascade"}),
    createdAt: timestamp().defaultNow()
}, table => [
    primaryKey({columns: [table.followerUserId,table.followingUserId]})
])
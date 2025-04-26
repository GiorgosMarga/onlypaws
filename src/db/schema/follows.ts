import { primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { schema, usersTable } from "./users";

export const followersTable = schema.table("followers", {
    followingUserId: uuid("following_user_id").notNull().references(() => usersTable.id, {"onDelete": "cascade"}), // the one who is being followed by the follower
    followerUserId: uuid("follower_user_id").notNull().references(() => usersTable.id,{"onDelete": "cascade"}), // the one who follows
    createdAt: timestamp("created_at").defaultNow()
}, table => [
    primaryKey({columns: [table.followerUserId,table.followingUserId]})
])
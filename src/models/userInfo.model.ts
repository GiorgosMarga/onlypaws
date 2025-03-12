import { userInfoTable } from "../db/schema/userInfo";

export type UserInfo = typeof userInfoTable.$inferSelect
export type UserInfoInsert = typeof userInfoTable.$inferInsert
import { refreshTokenTable } from "../db/schema/refreshTokens";

export type RefreshToken = typeof refreshTokenTable.$inferSelect
export type RefreshTokenInsert = typeof refreshTokenTable.$inferInsert
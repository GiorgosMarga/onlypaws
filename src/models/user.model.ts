import { usersTable } from "../db/schema/users";

export type UserInsert = typeof usersTable.$inferInsert
export type User = typeof usersTable.$inferSelect


export type UserData = {
    id: string
    email: string,
    verified_email: boolean,
    name: string,
    given_name: string,
    family_name: string,
    picture: string
  }

  export type GithubUserData = {
    id: string,
    email: string | null,
    name: string|null,
    login: string,
    avatar_url: string
  }
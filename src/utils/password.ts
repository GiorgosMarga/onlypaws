import bcrypt from "bcrypt"

const saltRounds = 10
export const hashPassword = (password: string): string => {
    const hashedPassword = bcrypt.hashSync(password,saltRounds)
    return hashedPassword
}

export const comparePasswords = (hashedPassword: string, plainTextPassword: string): boolean => {
    const isMatch = bcrypt.compareSync(plainTextPassword,hashedPassword)
    return isMatch
}
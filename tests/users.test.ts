import { StatusCodes } from "http-status-codes";
import {app} from "../src"
import request from "supertest" 
import { randomInt } from "crypto";
describe("User route", () => {
    describe("register user", () => {
        let userId: string;
        let token: string
        it("registers a user with email", async () => {
            const res = await request(app).post("/api/v1/users").send({username: "Jest Test", email: "jest@jest.com", password: "Jest Password"}).set("content-type", "application/json")
            expect(res.statusCode).toBe(StatusCodes.CREATED)
            expect(res.body).toHaveProperty("user")
            expect(res.body).toHaveProperty("access_token")
            expect(res.body).toHaveProperty("refresh_token")
            expect(res.body["user"].username).toBe("Jest Test")
            expect(res.body["user"].email).toBe("jest@jest.com")
            userId = res.body["user"].id as string
            token = res.body["access_token"] as string
        })
        it("tries to register a user with invalid body", async () => {
            const res = await request(app).post("/api/v1/users").send({}).set("content-type", "application/json")
            expect(res.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
        })
        afterAll(async () => {
            const res = await request(app).delete(`/api/v1/users/${userId}`).set("content-type", "application/json").set("authorization", `Bearer ${token}`)
            expect(res.statusCode).toBe(StatusCodes.OK)
        })
    })
    // it("Creates a user with duplicate email", async () => {
    //     const res = await request(app).post("/api/v1/users").send({username: "Jest Test", email, password: "Jest Password"}).set("content-type", "application/json")
    //     expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
    // })
    // it("Delete the user", async () => {
    //     const res = await request(app).delete(`/api/v1/users/${userId}`).set("content-type", "application/json").set("authorization", `Bearer ${token}`)
    //     expect(res.statusCode).toBe(StatusCodes.OK)
    // })
    // it("Fetches the deleted user", async () => {
    //     const res = await request(app).get(`/api/v1/users/${userId}`).set("content-type", "application/json")
    //     expect(res.statusCode).toBe(StatusCodes.NOT_FOUND)
    // })
    
})
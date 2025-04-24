// @ts-nocheck 
import { createClient } from 'redis';
import "dotenv/config"

export const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT!)
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

await redisClient.connect();
console.log("Redis client connected")


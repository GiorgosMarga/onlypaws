import "dotenv/config"
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DB_URI!
})
export const db = drizzle({client: pool})


await db.execute('select 1');


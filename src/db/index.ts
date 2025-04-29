import "dotenv/config"
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool } = pg;


declare global {
    var _pool: pg.Pool | undefined;
    var _db: ReturnType<typeof drizzle> | undefined
}

export const pool = global._pool || new Pool({
    connectionString: process.env.DB_URI!,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
    statement_timeout: 3000,
    idle_in_transaction_session_timeout: 6000,
    query_timeout: 3000,
    max: 10,
    min: 1
})

if(!global._pool) {
    global._pool = pool
}

export const db = global._db || drizzle({client: pool})
if(!global._db) {
    global._db = db
}



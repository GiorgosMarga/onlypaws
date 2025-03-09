import "dotenv/config"
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle({
    connection: {
        connectionString: process.env.DB_URI!
    },
    logger: true
})

await db.execute('select 1');


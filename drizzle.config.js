import { defineConfig } from 'drizzle-kit';
import "dotenv/config";
export default defineConfig({
    out: "./src/db/migrations",
    schema: "./src/db/schema",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DB_URI
    },
    verbose: true,
    strict: true
});

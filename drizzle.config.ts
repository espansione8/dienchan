import { defineConfig } from "drizzle-kit";
import type { Config } from "drizzle-kit";

export default defineConfig({
    dialect: 'sqlite', // 'postgresql' | 'mysql' | 'sqlite' | 'turso'
    schema: './src/lib/db/sqlite/schema', // get all schema files from this folder
    out: "./data/migration",
    dbCredentials: {
        url: "./data/sqlite.db"    // SQLite database path
        //url: import.meta.env.VITE_SQLITE_DB_PATH    // SQLite database path
    },
    //   migrations: './src/lib/db/sqlite/migrations',
    //   client: 'better-sqlite3',
    //   connection: {
    //     filename: './data/sqlite.db',
    //     // filename: './data/sqlite.db',
    //     // filename: './data/sqlite.db',
    //     location: ':memory:',
    //     // location: ':memory:',
    //     // location: './data/sqlite.db',
    //   },
}) satisfies Config;
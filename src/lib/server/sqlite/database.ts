import { SQLITE_DB } from '$env/static/private';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

const SQLITE_URI: string = SQLITE_DB;

if (!SQLITE_URI) {
    throw new Error('Please define the SQLITE_URI environment variable');
}

const sqlite = new Database(SQLITE_URI);
// Set all PRAGMA settings for best performace
// https://phiresky.github.io/blog/2020/sqlite-performance-tuning/
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('synchronous = NORMAL'); // OFF, NORMAL, FULL
sqlite.pragma('temp_store = MEMORY');
sqlite.pragma('mmap_size = 30000000000');
sqlite.pragma('busy_timeout = 30000');
sqlite.pragma('foreign_keys = ON');  // Optional but recommended

export const dbConnect = drizzle({ client: sqlite });

//new db generation
// npx drizzle-kit push
//  OR
//1. npx drizzle-kit generate
//2. npx drizzle-kit migrate

//open editor npx drizzle-kit studio 


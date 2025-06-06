import Database from 'better-sqlite3';
// const dbPath = '/path/database.db';
// const backupPath = `/path/backup/database_backup_${new Date().toISOString().replace(/:/g, '-')}.db`;
import fs from 'node:fs';
import path from 'node:path';

// Make paths configurable through environment variables or parameters
const dbPath = process.env.SQLITE_DB_PATH || './data/database.db';
const backupDir = process.env.BACKUP_DIR || './backups';
const timestamp = new Date().toISOString().replace(/:/g, '-');
const backupPath = path.join(backupDir, `database_backup_${timestamp}.db`);

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

try {
    // Validate source database exists
    if (!fs.existsSync(dbPath)) {
        throw new Error(`Source database not found: ${dbPath}`);
    }

    const db = new Database(dbPath);

    db.backup(backupPath)
        .then(() => {
            console.log('Backup SQLite done!');
            db.close(); // Chiudi la connessione al database originale se non più necessaria
        })
        .catch((err) => {
            console.error('Error backup SQLite:', err.message);
        });

} catch (err) {
    console.error('Error SQLite db:', err.message);
}
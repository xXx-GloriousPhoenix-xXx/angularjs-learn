const fs   = require('fs');
const path = require('path');

const DATA_DIR  = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Make sure the data directory and the users file exist before we ever read/write.
function ensureUsersFile() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [], profiles: [] }, null, 2));
    }
}

function readDb() {
    ensureUsersFile();
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    try {
        return JSON.parse(raw);
    } catch (err) {
        console.error('users.json is corrupted, resetting to empty state:', err);
        return { users: [], profiles: [] };
    }
}

function writeDb(db) {
    ensureUsersFile();
    fs.writeFileSync(USERS_FILE, JSON.stringify(db, null, 2));
}

module.exports = { readDb, writeDb, USERS_FILE, DATA_DIR };
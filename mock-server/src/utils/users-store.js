const { readDb, writeDb } = require('./storage');

/**
 * A thin Map-like wrapper around the "users" array in users.json,
 * so the rest of the codebase (auth.js, account.js) doesn't need to
 * change how it calls users.get/.set/.has - only the implementation
 * underneath becomes file-backed instead of memory-backed.
 */
const users = {
    get(username) {
        const db = readDb();
        return db.users.find(u => u.username === username) || undefined;
    },
    has(username) {
        const db = readDb();
        return db.users.some(u => u.username === username);
    },
    set(username, userObj) {
        const db = readDb();
        const idx = db.users.findIndex(u => u.username === username);
        if (idx === -1) {
            db.users.push(userObj);
        } else {
            db.users[idx] = userObj;
        }
        writeDb(db);
        return users;
    },
    delete(username) {
        const db = readDb();
        const idx = db.users.findIndex(u => u.username === username);
        if (idx === -1) return false;
        db.users.splice(idx, 1);
        writeDb(db);
        return true;
    },
};

module.exports = { users };
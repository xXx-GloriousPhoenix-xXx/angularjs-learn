const { readDb, writeDb } = require('../utils/storage');
const { generateProfile } = require('./profile-generator');

/**
 * Returns a stable pool of "other users" profiles for search/browse purposes.
 * Generated once and persisted to users.json under "searchPool", so that
 * results stay consistent across requests/filters instead of being
 * regenerated randomly on every call.
 */
function getSearchPool(size = 200) {
    const db = readDb();

    if (!db.searchPool || db.searchPool.length === 0) {
        db.searchPool = Array.from({ length: size }, (_, i) => generateProfile(i + 1));
        writeDb(db);
    }

    return db.searchPool;
}

/**
 * Returns the combined list of searchable profiles: real registered users
 * (from "profiles") plus the random filler pool (from "searchPool").
 * Deduplicated by username — a real profile always wins over a pool entry
 * with the same username (shouldn't normally happen, but just in case).
 */
function getAllSearchableProfiles() {
    const db = readDb();
    const pool = getSearchPool();

    const seen = new Set();
    const combined = [];

    for (const profile of db.profiles) {
        if (!seen.has(profile.username)) {
            seen.add(profile.username);
            combined.push(profile);
        }
    }
    for (const profile of pool) {
        if (!seen.has(profile.username)) {
            seen.add(profile.username);
            combined.push(profile);
        }
    }

    return combined;
}

module.exports = {
    getSearchPool,
    getAllSearchableProfiles,
};
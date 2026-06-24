const { readDb, writeDb } = require('../utils/storage');
const { generateProfile } = require('./profile-generator');

// Fields a client is allowed to change via PATCH
const PATCHABLE_FIELDS = ['firstName', 'lastName', 'description', 'stack', 'city', 'avatarUrl'];

function normalizeStack(value) {
    if (Array.isArray(value)) return value.map(s => String(s).trim()).filter(Boolean);
    if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
    return [];
}

/**
 * Returns the persisted profile for a username, creating one
 * (seeded with that username) and saving it to users.json the
 * first time it's requested.
 */
function getOrCreateProfile(username) {
    const db = readDb();
    let profile = db.profiles.find(p => p.username === username);

    if (!profile) {
        profile = generateProfile(username);
        profile.username = username; // keep the real login username, not a random one
        db.profiles.push(profile);
        writeDb(db);
    }

    return profile;
}

/**
 * Applies a partial update to a user's persisted profile and
 * writes the result back to users.json.
 * Only whitelisted fields are copied over; everything else is ignored.
 */
function patchProfile(username, patch) {
    const db = readDb();
    let idx = db.profiles.findIndex(p => p.username === username);

    if (idx === -1) {
        // No profile yet - create one first, then apply the patch on top.
        const seeded = generateProfile(username);
        seeded.username = username;
        db.profiles.push(seeded);
        idx = db.profiles.length - 1;
    }

    const profile = db.profiles[idx];
    for (const key of PATCHABLE_FIELDS) {
        if (patch[key] !== undefined) {
            profile[key] = key === 'stack' ? normalizeStack(patch[key]) : patch[key];
        }
    }

    db.profiles[idx] = profile;
    writeDb(db);
    return profile;
}

module.exports = {
    normalizeStack,
    getOrCreateProfile,
    patchProfile,
};
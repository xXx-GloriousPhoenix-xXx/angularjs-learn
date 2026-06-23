const { readDb, writeDb } = require('../utils/storage');

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
const lastNames  = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const cities     = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
const allStacks  = ['Python', 'Docker', 'Django', 'TypeScript', 'Angular', 'React', 'Node.js', 'PostgreSQL', 'Redis', 'Kubernetes', 'Go', 'Rust', 'Java', 'Spring', 'MongoDB'];
const descriptions = [
    'The skills list we discussed above is the core of a resume, but it\'s not the only part. You can also tell a little about yourself in the traditional sense — this section can be added to your cover letter.',
    'Passionate developer with a love for clean code and elegant solutions. Always looking for new challenges and opportunities to grow professionally.',
    'Full-stack engineer with experience in building scalable web applications. Open to collaboration and excited about open source projects.',
    'Backend specialist focused on high-performance systems. Enjoy solving complex architectural problems and optimizing database queries.',
    'Frontend enthusiast who cares deeply about UX and accessibility. Believe that great design and great code go hand in hand.',
];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomSubset(arr, min = 2, max = 5) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
}

function randomDateWithinLastYears(years = 3) {
    const now = Date.now();
    const past = now - years * 365 * 24 * 60 * 60 * 1000;
    const ts = past + Math.random() * (now - past);
    return new Date(ts).toISOString().slice(0, 10); // YYYY-MM-DD
}

// Random, throwaway profile generator — used for /test_account, /subscribers, /:id.
// These are NOT persisted.
function generateProfile(id) {
    const firstName = randomItem(firstNames);
    const lastName  = randomItem(lastNames);
    return {
        id,
        username:            `${firstName.toLowerCase()}_${lastName.toLowerCase()}${id}`,
        avatarUrl:           `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
        subscriptionsAmount: Math.floor(Math.random() * 100),
        firstName,
        lastName,
        description:         randomItem(descriptions),
        isActive:            Math.random() > 0.3,
        stack:               randomSubset(allStacks),
        city:                randomItem(cities),
        registerDate:        randomDateWithinLastYears(),
    };
}

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
    const db  = readDb();
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
    generateProfile,
    getOrCreateProfile,
    patchProfile,
    getSearchPool,
    filterProfiles,
};

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

/**
 * Filters all searchable profiles (real users + the random pool) by the
 * given criteria and returns a paginated slice.
 *
 * params:
 *   name         - matched against firstName, lastName, OR username (case-insensitive, substring)
 *   city         - case-insensitive substring match
 *   stack        - comma-separated string or array; profile must contain ALL requested skills
 *   registerDate - exact date match (YYYY-MM-DD)
 *   pageNum, pageSize - pagination
 */
function filterProfiles(params = {}) {
    const pool = getAllSearchableProfiles();

    const name         = (params.name || '').trim().toLowerCase();
    const city         = (params.city || '').trim().toLowerCase();
    const registerDate = (params.registerDate || '').trim();
    const requestedStack = normalizeStack(params.stack || []);
    const excludeUsername = (params.excludeUsername || '').trim().toLowerCase();

    let results = pool.filter(profile => {
        if (excludeUsername && (profile.username || '').toLowerCase() === excludeUsername) {
            return false;
        }

        if (name) {
            const matchesName =
                (profile.firstName || '').toLowerCase().includes(name) ||
                (profile.lastName || '').toLowerCase().includes(name) ||
                (profile.username || '').toLowerCase().includes(name);
            if (!matchesName) return false;
        }

        if (city && !(profile.city || '').toLowerCase().includes(city)) {
            return false;
        }

        if (registerDate && profile.registerDate !== registerDate) {
            return false;
        }

        if (requestedStack.length > 0) {
            const profileStackLower = (profile.stack || []).map(s => s.toLowerCase());
            const hasAllSkills = requestedStack.every(skill =>
                profileStackLower.includes(skill.toLowerCase())
            );
            if (!hasAllSkills) return false;
        }

        return true;
    });

    const pageNum  = Math.max(1, parseInt(params.pageNum, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(params.pageSize, 10) || 10));
    const itemCount = results.length;
    const pageCount = Math.max(1, Math.ceil(itemCount / pageSize));

    const start = (pageNum - 1) * pageSize;
    const items = results.slice(start, start + pageSize);

    return { items, itemCount, pageNum, pageSize, pageCount };
}
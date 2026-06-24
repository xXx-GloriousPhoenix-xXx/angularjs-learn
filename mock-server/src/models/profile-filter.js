const { getAllSearchableProfiles } = require('./profile-search-pool');
const { normalizeStack } = require('./profile-store');
const { fuzzyMatch } = require('../utils/trigram');

// Below this similarity score, a name/city is considered "not a match".
// 0.3 is a reasonable starting point — raise it for stricter matching,
// lower it to be more typo-tolerant (at the cost of more noisy results).
const NAME_MATCH_THRESHOLD = 0.3;
const CITY_MATCH_THRESHOLD = 0.3;

/**
 * Filters all searchable profiles (real users + the random pool) by the
 * given criteria and returns a paginated slice.
 *
 * params:
 *   name         - fuzzy-matched against firstName, lastName, OR username
 *                  (substring match first, trigram similarity as fallback —
 *                  so typos and partial names still surface results)
 *   city         - fuzzy substring/trigram match, same approach as name
 *   stack        - comma-separated string or array; profile must contain ALL requested skills
 *   registerDate - exact date match (YYYY-MM-DD)
 *   pageNum, pageSize - pagination
 */
function filterProfiles(params = {}) {
    const pool = getAllSearchableProfiles();

    const name           = (params.name || '').trim();
    const city           = (params.city || '').trim();
    const registerDate   = (params.registerDate || '').trim();
    const requestedStack = normalizeStack(params.stack || []);
    const excludeUsername = (params.excludeUsername || '').trim().toLowerCase();

    let results = pool.filter(profile => {
        if (excludeUsername && (profile.username || '').toLowerCase() === excludeUsername) {
            return false;
        }

        if (name && !matchesName(profile, name)) {
            return false;
        }

        if (city && !fuzzyMatch(profile.city || '', city, CITY_MATCH_THRESHOLD)) {
            return false;
        }

        if (registerDate && profile.registerDate !== registerDate) {
            return false;
        }

        if (requestedStack.length > 0 && !matchesAllSkills(profile, requestedStack)) {
            return false;
        }

        return true;
    });

    return paginate(results, params);
}

/**
 * A profile matches the name query if ANY of firstName/lastName/username
 * fuzzily matches it. Each field is checked independently — best match wins.
 */
function matchesName(profile, name) {
    return (
        fuzzyMatch(profile.firstName || '', name, NAME_MATCH_THRESHOLD) ||
        fuzzyMatch(profile.lastName || '', name, NAME_MATCH_THRESHOLD) ||
        fuzzyMatch(profile.username || '', name, NAME_MATCH_THRESHOLD)
    );
}

/**
 * Skills/stack stays an exact match on purpose — "React" and "Recat" are
 * different technologies, not a typo of each other, so fuzzy matching
 * would do more harm than good here.
 */
function matchesAllSkills(profile, requestedStack) {
    const profileStackLower = (profile.stack || []).map(s => s.toLowerCase());
    return requestedStack.every(skill => profileStackLower.includes(skill.toLowerCase()));
}

function paginate(results, params) {
    const pageNum  = Math.max(1, parseInt(params.pageNum, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(params.pageSize, 10) || 10));
    const itemCount = results.length;
    const pageCount = Math.max(1, Math.ceil(itemCount / pageSize));

    const start = (pageNum - 1) * pageSize;
    const items = results.slice(start, start + pageSize);

    return { items, itemCount, pageNum, pageSize, pageCount };
}

module.exports = {
    filterProfiles,
};
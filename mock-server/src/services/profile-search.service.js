const profileRepository = require('../repositories/profile.repository');
const { normalizeStack } = require('./profile.service');
const { fuzzyMatch } = require('../utils/trigram');

const NAME_MATCH_THRESHOLD = 0.3;
const CITY_MATCH_THRESHOLD = 0.3;

/**
 * Filters real registered profiles (no more fake filler pool — that
 * concept is gone now that fake profile generation was removed).
 *
 * params:
 *   name         - fuzzy-matched against firstName, lastName, OR username
 *   city         - fuzzy substring/trigram match
 *   stack        - comma-separated string or array; profile must contain ALL requested skills
 *   registerDate - exact date match (YYYY-MM-DD)
 *   pageNum, pageSize - pagination
 */
function filterProfiles(params = {}) {
    const allProfiles = profileRepository.readAll();

    const name            = (params.name || '').trim();
    const city            = (params.city || '').trim();
    const registerDate    = (params.registerDate || '').trim();
    const requestedStack  = normalizeStack(params.stack || []);
    const excludeUsername = (params.excludeUsername || '').trim().toLowerCase();

    const results = allProfiles.filter(profile => {
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

function matchesName(profile, name) {
    return (
        fuzzyMatch(profile.firstName || '', name, NAME_MATCH_THRESHOLD) ||
        fuzzyMatch(profile.lastName || '', name, NAME_MATCH_THRESHOLD) ||
        fuzzyMatch(profile.username || '', name, NAME_MATCH_THRESHOLD)
    );
}

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
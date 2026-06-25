const profileRepository = require('../repositories/profile.repository');

const PATCHABLE_FIELDS = ['firstName', 'lastName', 'description', 'stack', 'city', 'avatarUrl'];

function normalizeStack(value) {
    if (Array.isArray(value)) return value.map(s => String(s).trim()).filter(Boolean);
    if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
    return [];
}

/**
 * Returns the profile for a username, creating a minimal empty one the
 * first time it's requested (e.g. right after registration, before the
 * user has filled in their profile form).
 */
function getOrCreateProfile(username) {
    let profile = profileRepository.findByUsername(username);

    if (!profile) {
        profile = {
            id: username,
            username,
            avatarUrl: null,
            subscriptionsAmount: 0,
            firstName: '',
            lastName: '',
            description: '',
            isActive: true,
            stack: [],
            city: '',
            registerDate: new Date().toISOString().slice(0, 10),
        };
        profileRepository.save(profile);
    }

    return profile;
}

function patchProfile(username, patch) {
    const profile = getOrCreateProfile(username);

    for (const key of PATCHABLE_FIELDS) {
        if (patch[key] !== undefined) {
            profile[key] = key === 'stack' ? normalizeStack(patch[key]) : patch[key];
        }
    }

    return profileRepository.save(profile);
}

module.exports = {
    normalizeStack,
    getOrCreateProfile,
    patchProfile,
};
/**
 * Public entry point for profile-related logic.
 *
 * This file used to contain everything in one place (generation, storage,
 * search pool, and filtering). It's now split into focused modules:
 *
 *   profile-generator.js    - random fake profile generation
 *   profile-store.js        - persisted profile read/create/patch
 *   profile-search-pool.js  - the combined real+filler pool used for search
 *   profile-filter.js       - the actual search/filter/pagination logic
 *
 * Everything is re-exported here so existing `require('./profiles')`
 * call sites elsewhere in the app don't need to change.
 */

const { generateProfile } = require('./profile-generator');
const { getOrCreateProfile, patchProfile } = require('./profile-store');
const { getSearchPool, getAllSearchableProfiles } = require('./profile-search-pool');
const { filterProfiles } = require('./profile-filter');

module.exports = {
    generateProfile,
    getOrCreateProfile,
    patchProfile,
    getSearchPool,
    getAllSearchableProfiles,
    filterProfiles,
};
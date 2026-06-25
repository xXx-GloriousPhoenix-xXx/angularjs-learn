const { readJsonFile, writeJsonFile } = require('./json-file.repository');

const FILE = 'profiles.json';

function readAll() {
    return readJsonFile(FILE, []);
}

function findByUsername(username) {
    return readAll().find(p => p.username === username) || null;
}

function save(profile) {
    const profiles = readAll();
    const idx = profiles.findIndex(p => p.username === profile.username);

    if (idx === -1) {
        profiles.push(profile);
    } else {
        profiles[idx] = profile;
    }

    writeJsonFile(FILE, profiles);
    return profile;
}

module.exports = {
    readAll,
    findByUsername,
    save,
};
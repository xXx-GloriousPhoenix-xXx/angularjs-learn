const { readJsonFile, writeJsonFile } = require('./json-file.repository');

const FILE = 'users.json';

function readAll() {
    return readJsonFile(FILE, []);
}

function findByUsername(username) {
    return readAll().find(u => u.username === username) || null;
}

function exists(username) {
    return findByUsername(username) !== null;
}

function create(user) {
    const users = readAll();
    users.push(user);
    writeJsonFile(FILE, users);
    return user;
}

module.exports = {
    findByUsername,
    exists,
    create,
};
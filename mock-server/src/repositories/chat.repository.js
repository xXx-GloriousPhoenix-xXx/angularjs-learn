const { readJsonFile, writeJsonFile } = require('./json-file.repository');
const FILE = 'chats.json';

function readAll() {
    return readJsonFile(FILE, []);
}

function save(chats) {
    writeJsonFile(FILE, chats);
}

module.exports = { readAll, save };
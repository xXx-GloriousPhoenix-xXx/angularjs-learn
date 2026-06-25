const { readJsonFile, writeJsonFile } = require('./json-file.repository');

const FILE = 'tokens.json';
const DEFAULT_TOKENS = { access: {}, refresh: {} };

function readTokens() {
    return readJsonFile(FILE, DEFAULT_TOKENS);
}

function setAccessToken(token, username) {
    const tokens = readTokens();
    tokens.access[token] = username;
    writeJsonFile(FILE, tokens);
}

function setRefreshToken(token, username) {
    const tokens = readTokens();
    tokens.refresh[token] = username;
    writeJsonFile(FILE, tokens);
}

function getUsernameByAccessToken(token) {
    const tokens = readTokens();
    return tokens.access[token] || null;
}

function getUsernameByRefreshToken(token) {
    const tokens = readTokens();
    return tokens.refresh[token] || null;
}

function deleteRefreshToken(token) {
    const tokens = readTokens();
    delete tokens.refresh[token];
    writeJsonFile(FILE, tokens);
}

function deleteAccessToken(token) {
    const tokens = readTokens();
    delete tokens.access[token];
    writeJsonFile(FILE, tokens);
}

module.exports = {
    setAccessToken,
    setRefreshToken,
    getUsernameByAccessToken,
    getUsernameByRefreshToken,
    deleteRefreshToken,
    deleteAccessToken
};
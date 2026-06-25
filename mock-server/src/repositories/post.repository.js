const { readJsonFile, writeJsonFile } = require('./json-file.repository');

const FILE = 'posts.json';

function readAll() {
    return readJsonFile(FILE, []);
}

function findById(id) {
    return readAll().find(p => p.id === id) || null;
}

function findByParentId(parentId) {
    return readAll().filter(p => p.parentId === parentId);
}

function save(posts) {
    writeJsonFile(FILE, posts);
}

function insert(post) {
    const posts = readAll();
    posts.push(post);
    writeJsonFile(FILE, posts);
    return post;
}

module.exports = {
    readAll,
    findById,
    findByParentId,
    save,
    insert,
};
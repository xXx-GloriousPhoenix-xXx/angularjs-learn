const { readJsonFile, writeJsonFile } = require('./json-file.repository');

const FILE = 'subscriptions.json';

function readAll() {
    return readJsonFile(FILE, []);
}

function save(subscriptions) {
    writeJsonFile(FILE, subscriptions);
}

function findSubscription(followerUsername, followingUsername) {
    return readAll().find(
        s => s.followerUsername === followerUsername && s.followingUsername === followingUsername
    ) || null;
}

function findSubscribers(username) {
    return readAll().filter(s => s.followingUsername === username);
}

function findFollowing(username) {
    return readAll().filter(s => s.followerUsername === username);
}

function subscribe(followerUsername, followingUsername) {
    const subs = readAll();
    const exists = subs.some(
        s => s.followerUsername === followerUsername && s.followingUsername === followingUsername
    );
    
    if (!exists) {
        subs.push({ followerUsername, followingUsername });
        save(subs);
    }
}

function unsubscribe(followerUsername, followingUsername) {
    let subs = readAll();
    subs = subs.filter(
        s => !(s.followerUsername === followerUsername && s.followingUsername === followingUsername)
    );
    save(subs);
}

module.exports = {
    readAll,
    findSubscription,
    findSubscribers,
    findFollowing,
    subscribe,
    unsubscribe
};
const { generateProfile } = require('./profile-generator');

const sampleContents = [
    'Just shipped a new feature, feeling great about it!',
    'Anyone else debugging CSS at 2am? Just me? Okay.',
    'Reactive forms in Angular finally clicked for me today.',
    'Coffee count: 4. Bugs fixed: 1. Worth it.',
    'Looking for feedback on my latest side project.',
    'TIL trigram search is way better than plain substring matching.',
    'Refactoring legacy code feels like archaeology sometimes.',
    'Friday deploy? Living dangerously today.',
];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateWithinLastDays(days = 14) {
    const now = Date.now();
    const past = now - days * 24 * 60 * 60 * 1000;
    return new Date(past + Math.random() * (now - past)).toISOString();
}

/**
 * Generates a single random post or reply.
 * parentId: null for a top-level post, or an existing post id for a reply.
 */
function generatePost(id, parentId = null) {
    const author = generateProfile(`post-author-${id}`);

    return {
        id: String(id),
        authorId: author.username,
        author,
        content: randomItem(sampleContents),
        parentId,
        likesCount: Math.floor(Math.random() * 50),
        isLikedByMe: false,
        repliesCount: 0, // filled in by whoever builds the seed tree (see seedPostTree)
        createdAt: randomDateWithinLastDays(),
    };
}

module.exports = {
    generatePost,
};
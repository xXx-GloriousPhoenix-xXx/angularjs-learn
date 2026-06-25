const { readDb, writeDb } = require('../utils/storage');
const { generatePost } = require('./post-generator');

/**
 * Recalculates repliesCount for every post in the db, by counting how many
 * posts have each post's id as their parentId, RECURSIVELY (a reply to a
 * reply counts towards the original post's count too — that's what makes
 * "Reply (12)" mean "12 replies in this whole thread", not just direct ones).
 *
 * This is intentionally simple (recompute everything) rather than trying to
 * incrementally patch counts on every write — with a JSON-file "database"
 * the dataset is small, so recomputing is cheap and far less error-prone
 * than trying to keep incremental counters in sync by hand.
 */
function recalculateReplyCounts(posts) {
    const childrenOf = new Map(); // parentId -> [direct children]
    for (const post of posts) {
        if (post.parentId === null) continue;
        if (!childrenOf.has(post.parentId)) childrenOf.set(post.parentId, []);
        childrenOf.get(post.parentId).push(post);
    }

    function countDescendants(postId) {
        const directChildren = childrenOf.get(postId) || [];
        let total = directChildren.length;
        for (const child of directChildren) {
            total += countDescendants(child.id);
        }
        return total;
    }

    for (const post of posts) {
        post.repliesCount = countDescendants(post.id);
    }
}

/**
 * Returns posts matching a given parentId (null = top-level feed posts),
 * paginated, newest first. Also computes `isLikedByMe` relative to the
 * requesting user.
 */
function getPosts({ parentId = null, pageNum = 1, pageSize = 10, currentUsername = null, authorUsername = null }) {
    const db = readDb();

    const normalizedParentId = parentId === undefined || parentId === 'null' ? null : parentId;

    const matching = db.posts
        .filter(post => {
            const isCorrectParent = post.parentId === normalizedParentId;
            const isCorrectAuthor = normalizedParentId !== null 
                ? true 
                : (authorUsername ? post.author.username === authorUsername : true);
            return isCorrectParent && isCorrectAuthor;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const itemCount = matching.length;
    const safePageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
    const safePageNum = Math.max(1, parseInt(pageNum, 10) || 1);
    const pageCount = Math.max(1, Math.ceil(itemCount / safePageSize));
    const start = (safePageNum - 1) * safePageSize;

    const items = matching
        .slice(start, start + safePageSize)
        .map(post => withLikeState(post, currentUsername));

    return { items, itemCount, pageNum: safePageNum, pageSize: safePageSize, pageCount };
}

function withLikeState(post, currentUsername) {
    const likedBy = post.likedBy || [];
    return {
        ...post,
        isLikedByMe: currentUsername ? likedBy.includes(currentUsername) : false,
        likesCount: likedBy.length,
    };
}

function createPost({ authorUsername, content, parentId = null }) {
    const db = readDb();

    if (parentId) {
        const parentExists = db.posts.some(p => p.id === parentId);
        if (!parentExists) {
            throw new Error(`Parent post ${parentId} does not exist`);
        }
    }

    const author = db.profiles.find(p => p.username === authorUsername);

    const newPost = {
        id: `post-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        authorId: authorUsername,
        author,
        content,
        parentId: parentId || null,
        likedBy: [],
        repliesCount: 0,
        createdAt: new Date().toISOString(),
    };

    db.posts.push(newPost);
    recalculateReplyCounts(db.posts);
    writeDb(db);

    return withLikeState(newPost, authorUsername);
}

function setLike({ postId, username, liked }) {
    const db = readDb();

    const post = db.posts.find(p => p.id === postId);
    if (!post) {
        throw new Error(`Post ${postId} not found`);
    }

    if (!post.likedBy) post.likedBy = [];

    const alreadyLiked = post.likedBy.includes(username);
    if (liked && !alreadyLiked) {
        post.likedBy.push(username);
    } else if (!liked && alreadyLiked) {
        post.likedBy = post.likedBy.filter(u => u !== username);
    }

    writeDb(db);
    return withLikeState(post, username);
}

/**
 * Seeds a small initial tree of posts + nested replies the first time
 * posts are requested, so the feed isn't empty on a fresh database.
 */
function ensurePostsSeeded(db) {
    if (db.posts && db.posts.length > 0) return;

    db.posts = [];
    let nextId = 1;

    for (let i = 0; i < 15; i++) {
        const topLevel = generatePost(nextId++);
        delete topLevel.repliesCount; // recalculated below
        topLevel.likedBy = [];
        db.posts.push(topLevel);

        const replyCount = Math.floor(Math.random() * 4);
        for (let r = 0; r < replyCount; r++) {
            const reply = generatePost(nextId++, topLevel.id);
            delete reply.repliesCount;
            reply.likedBy = [];
            db.posts.push(reply);

            // occasionally add a reply-to-a-reply, to exercise nesting
            if (Math.random() > 0.6) {
                const nestedReply = generatePost(nextId++, reply.id);
                delete nestedReply.repliesCount;
                nestedReply.likedBy = [];
                db.posts.push(nestedReply);
            }
        }
    }

    recalculateReplyCounts(db.posts);
    writeDb(db);
}

module.exports = {
    getPosts,
    createPost,
    setLike,
};
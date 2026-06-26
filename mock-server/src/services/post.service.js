const postRepository = require('../repositories/post.repository');
const profileRepository = require('../repositories/profile.repository');

class PostError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

/**
 * Recalculates repliesCount for every post, counting descendants
 * recursively (a reply to a reply counts towards the original post too).
 */
function recalculateReplyCounts(posts) {
    const childrenOf = new Map();
    for (const post of posts) {
        if (post.parentId === null) continue;
        if (!childrenOf.has(post.parentId)) childrenOf.set(post.parentId, []);
        childrenOf.get(post.parentId).push(post);
    }

    function countDescendants(postId) {
        const directChildren = childrenOf.get(postId) || [];
        return directChildren.reduce((total, child) => total + 1 + countDescendants(child.id), 0);
    }

    for (const post of posts) {
        post.repliesCount = countDescendants(post.id);
    }
}

function withLikeState(post, currentUsername) {
    const likedBy = post.likedBy || [];
    return {
        ...post,
        isLikedByMe: currentUsername ? likedBy.includes(currentUsername) : false,
        likesCount: likedBy.length,
    };
}

function paginate(items, pageNum, pageSize) {
    const safePageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
    const safePageNum  = Math.max(1, parseInt(pageNum, 10) || 1);
    const itemCount = items.length;
    const pageCount = Math.max(1, Math.ceil(itemCount / safePageSize));
    const start = (safePageNum - 1) * safePageSize;

    return {
        items: items.slice(start, start + safePageSize),
        itemCount,
        pageNum: safePageNum,
        pageSize: safePageSize,
        pageCount,
    };
}

/**
 * Gets posts matching a parentId (null = top-level feed), newest first.
 */
function getPosts({
    parentId = null,
    pageNum = 1,
    pageSize = 10,
    currentUsername = null,
    authorUsername = null
}) {
    const normalizedParentId = parentId === undefined || parentId === 'null' ? null : parentId;

    let matching = postRepository
        .findByParentId(normalizedParentId)
        .filter(p => !p.isDeleted)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (authorUsername) {
        matching = matching.filter(post =>
            post.author && post.author.username === authorUsername
        );
    }

    const page = paginate(matching, pageNum, pageSize);
    page.items = page.items.map(post => withLikeState(post, currentUsername));
    return page;
}

function createPost({ authorUsername, content, parentId = null }) {
    if (parentId) {
        const parentExists = postRepository.findById(parentId) !== null;
        if (!parentExists) {
            throw new PostError(`Parent post ${parentId} does not exist`, 400);
        }
    }

    const author = profileRepository.findByUsername(authorUsername);

    const newPost = {
        id: `post-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        authorId: authorUsername,
        author,
        content,
        parentId: parentId || null,
        likedBy: [],
        isDeleted: false,
        createdAt: new Date().toISOString(),
    };

    const allPosts = postRepository.readAll();
    allPosts.push(newPost);
    recalculateReplyCounts(allPosts);
    postRepository.save(allPosts);

    return withLikeState(newPost, authorUsername);
}

function setLike({ postId, username, liked }) {
    const allPosts = postRepository.readAll();
    const post = allPosts.find(p => p.id === postId);

    if (!post) {
        throw new PostError(`Post ${postId} not found`, 404);
    }

    if (!post.likedBy) post.likedBy = [];

    const alreadyLiked = post.likedBy.includes(username);
    if (liked && !alreadyLiked) {
        post.likedBy.push(username);
    } else if (!liked && alreadyLiked) {
        post.likedBy = post.likedBy.filter(u => u !== username);
    }

    postRepository.save(allPosts);
    return withLikeState(post, username);
}

function deletePost(postId, username) {
    const allPosts = postRepository.readAll();
    const post = allPosts.find(p => p.id === postId);

    if (!post) {
        throw new PostError('Post not found', 404);
    }
    if (post.author.username !== username) {
        throw new PostError('You can only delete your own posts', 403);
    }

    post.isDeleted = true;
    postRepository.save(allPosts);
}

function getDeletedPosts(username) {
    const all = postRepository.readAll();
    return all.filter(p => p.isDeleted && p.author.username === username);
}

function restorePost(postId, username) {
    const allPosts = postRepository.readAll();
    const post = allPosts.find(p => p.id === postId);

    if (!post) {
        throw new PostError('Post not found', 404);
    }
    if (post.author.username !== username) {
        throw new PostError('You can only restore your own posts', 403);
    }
    if (!post.isDeleted) {
        throw new PostError('Post is not deleted', 400);
    }

    post.isDeleted = false;
    postRepository.save(allPosts);
    return withLikeState(post, username);
}

module.exports = {
    PostError,
    getPosts,
    createPost,
    setLike,
    deletePost,
    getDeletedPosts,
    restorePost
};
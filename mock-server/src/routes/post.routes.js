const { Router } = require('express');
const postService = require('../services/post.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = Router();

router.get('/trash', requireAuth, (req, res) => {
    try {
        const posts = postService.getDeletedPosts(req.username);
        res.json(posts);
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.get('/', requireAuth, (req, res) => {
    const result = postService.getPosts({
        parentId: req.query.parentId ?? null,
        pageNum: req.query.pageNum,
        pageSize: req.query.pageSize,
        currentUsername: req.username,
        authorUsername: req.query.authorUsername || null,
    });

    res.json(result);
});

router.post('/', requireAuth, (req, res) => {
    const { content, parentId } = req.body || {};

    if (!content || !content.trim()) {
        return res.status(400).json({ error: 'content is required' });
    }

    try {
        const post = postService.createPost({
            authorUsername: req.username,
            content: content.trim(),
            parentId: parentId || null,
        });
        res.status(201).json(post);
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.post('/:id/like', requireAuth, (req, res) => {
    try {
        const post = postService.setLike({ postId: req.params.id, username: req.username, liked: true });
        res.json(post);
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.delete('/:id/like', requireAuth, (req, res) => {
    try {
        const post = postService.setLike({ postId: req.params.id, username: req.username, liked: false });
        res.json(post);
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.delete('/:id/hard', requireAuth, (req, res) => {
    try {
        postService.hardDeletePost(req.params.id, req.username);
        res.status(204).send();
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.delete('/:id', requireAuth, (req, res) => {
    try {
        postService.deletePost(req.params.id, req.username);
        res.status(204).send();
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.patch('/:id/restore', requireAuth, (req, res) => {
    try {
        postService.restorePost(req.params.id, req.username);
        res.json({ success: true });
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

module.exports = router;
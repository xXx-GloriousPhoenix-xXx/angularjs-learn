const { Router } = require('express');
const { getPosts, createPost, setLike } = require('../models/post-store');
const { requireAuth } = require('../middleware/auth');

const router = Router();

/**
 * @openapi
 * /posts:
 *   get:
 *     tags: [Posts]
 *     summary: Get posts (top-level feed, or replies to a specific post)
 *     description: |
 *       Omit `parentId` to get top-level feed posts. Pass `parentId` to get
 *       the DIRECT replies to that post only (not the whole nested tree —
 *       the client recursively calls this again for any reply that itself
 *       has repliesCount > 0).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema: { type: string }
 *         description: If provided, returns direct replies to this post id. Omit for top-level feed posts.
 *       - in: query
 *         name: pageNum
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Post' }
 *                 itemCount: { type: integer, example: 15 }
 *                 pageNum:   { type: integer, example: 1 }
 *                 pageSize:  { type: integer, example: 10 }
 *                 pageCount: { type: integer, example: 2 }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/', requireAuth, (req, res) => {
    console.debug('/posts request', req.query);

    const result = getPosts({
        parentId: req.query.parentId ?? null,
        pageNum: req.query.pageNum,
        pageSize: req.query.pageSize,
        currentUsername: req.username,
    });

    res.json(result);
});

/**
 * @openapi
 * /posts:
 *   post:
 *     tags: [Posts]
 *     summary: Create a new post, or a reply to an existing post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: Just shipped a new feature!
 *               parentId:
 *                 type: string
 *                 nullable: true
 *                 description: Omit or set to null for a top-level post; set to a post id to create a reply.
 *     responses:
 *       201:
 *         description: The created post
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Post' }
 *       400:
 *         description: Missing content, or parentId does not exist
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', requireAuth, (req, res) => {
    console.debug('/posts create request', req.body);

    const { content, parentId } = req.body || {};

    if (!content || !content.trim()) {
        return res.status(400).json({ error: 'content is required' });
    }

    try {
        const post = createPost({
            authorUsername: req.username,
            content: content.trim(),
            parentId: parentId || null,
        });
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @openapi
 * /posts/{id}/like:
 *   post:
 *     tags: [Posts]
 *     summary: Like a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated post with new like state
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Post' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/:id/like', requireAuth, (req, res) => {
    console.debug('/posts/:id/like request', req.params.id);

    try {
        const post = setLike({ postId: req.params.id, username: req.username, liked: true });
        res.json(post);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

/**
 * @openapi
 * /posts/{id}/like:
 *   delete:
 *     tags: [Posts]
 *     summary: Unlike a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated post with new like state
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Post' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id/like', requireAuth, (req, res) => {
    console.debug('/posts/:id/like (unlike) request', req.params.id);

    try {
        const post = setLike({ postId: req.params.id, username: req.username, liked: false });
        res.json(post);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

module.exports = router;
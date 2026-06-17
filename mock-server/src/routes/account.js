const { Router } = require('express');
const { users }           = require('../utils/tokens');
const { generateProfile } = require('../data/profiles');
const { requireAuth }     = require('../middleware/auth');

const router = Router();

/**
 * @openapi
 * /account/test_account:
 *   get:
 *     tags: [Account]
 *     summary: Get 5 sample profiles (no auth required)
 *     responses:
 *       200:
 *         description: Array of sample profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Profile' }
 */
router.get('/test_account', (req, res) => {
    console.debug('/account/test_account request');
    const profiles = Array.from({ length: 5 }, (_, i) => generateProfile(i + 1));
    res.json(profiles);
});

/**
 * @openapi
 * /account/me:
 *   get:
 *     tags: [Account]
 *     summary: Get current user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Profile' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/me', requireAuth, (req, res) => {
    console.debug('/account/me request');
    const user = users.get(req.username);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(generateProfile(req.username));
});

/**
 * @openapi
 * /account/subscribers:
 *   get:
 *     tags: [Account]
 *     summary: Get paginated list of subscribers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageNum
 *         schema: { type: integer, default: 1, minimum: 1 }
 *         description: Page number (1-based)
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10, minimum: 1, maximum: 100 }
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Paginated subscribers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Profile' }
 *                 totalCount: { type: integer, example: 237 }
 *                 pageNum:    { type: integer, example: 1 }
 *                 pageSize:   { type: integer, example: 10 }
 *                 totalPages: { type: integer, example: 24 }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/subscribers', requireAuth, (req, res) => {
    console.debug('/account/subscribers request');

    const pageNum  = Math.max(1, parseInt(req.query.pageNum)  || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 10));

    // Deterministic count per user: same result every call, different per username
    const TOTAL_COUNT = (req.username.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 900) + 100;
    const pageCount  = Math.ceil(TOTAL_COUNT / pageSize);

    const start = (pageNum - 1) * pageSize;
    const items = Array.from({ length: Math.min(pageSize, Math.max(0, TOTAL_COUNT - start)) }, (_, i) =>
        generateProfile(start + i + 1)
    );

    res.json({ items, itemCount: TOTAL_COUNT, pageNum, pageSize, pageCount });
});

/**
 * @openapi
 * /account/{id}:
 *   get:
 *     tags: [Account]
 *     summary: Get profile by numeric ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Numeric user ID
 *     responses:
 *       200:
 *         description: Profile for the given ID
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Profile' }
 *       400:
 *         description: Invalid (non-numeric) ID
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', (req, res) => {
    console.debug('/account/:id request');
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
    res.json(generateProfile(id));
});

module.exports = router;
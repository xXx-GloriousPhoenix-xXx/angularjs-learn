const { Router } = require('express');
const { hashPassword }                                        = require('../utils/crypto');
const { users, accessTokens, refreshTokens, issueTokenPair } = require('../utils/tokens');
const { requireAuth }                                         = require('../middleware/auth');

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string, example: james_smith }
 *               email:    { type: string, format: email, example: james@example.com }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: User registered successfully }
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Username already taken
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/register', (req, res) => {
    console.debug('/register request');
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'username, email and password are required' });
    }
    if (users.has(username)) {
        return res.status(409).json({ error: 'Username already taken' });
    }

    users.set(username, { username, email, passwordHash: hashPassword(password) });
    return res.status(201).json({ message: 'User registered successfully' });
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and get token pair
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string, example: james_smith }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       200:
 *         description: Token pair issued
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TokenPair' }
 *       400:
 *         description: Missing fields or invalid credentials
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/login', (req, res) => {
    console.debug('/login request');
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required' });
    }

    const user = users.get(username);
    if (!user || user.passwordHash !== hashPassword(password)) {
        return res.status(400).json({ error: 'Invalid username or password' });
    }

    return res.json(issueTokenPair(username));
});

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     description: Consumes the refresh token (one-time use) and returns a new token pair.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties:
 *               refresh_token: { type: string }
 *     responses:
 *       200:
 *         description: New token pair issued
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TokenPair' }
 *       400:
 *         description: Missing refresh_token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Invalid or expired refresh_token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/refresh', (req, res) => {
    console.debug('/refresh request');
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ error: 'refresh_token is required' });
    }

    const username = refreshTokens.get(refresh_token);
    if (!username) {
        return res.status(403).json({ error: 'Invalid or expired refresh_token' });
    }

    refreshTokens.delete(refresh_token);
    return res.json(issueTokenPair(username));
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Invalidate access token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Logged out successfully }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/logout', requireAuth, (req, res) => {
    console.debug('/logout request');
    const raw   = req.headers['token'] || req.headers['authorization'];
    const token = raw?.startsWith('Bearer ') ? raw.slice(7) : raw;
    accessTokens.delete(token);
    return res.json({ message: 'Logged out successfully' });
});

module.exports = router;
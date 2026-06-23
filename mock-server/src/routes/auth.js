const { Router } = require('express');
const { hashPassword }                                        = require('../utils/crypto');
const { users, accessTokens, refreshTokens, issueTokenPair } = require('../utils/tokens');
const { requireAuth }                                         = require('../middleware/auth');

const router = Router();

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

router.post('/logout', requireAuth, (req, res) => {
    console.debug('/logout request');
    const raw   = req.headers['token'] || req.headers['authorization'];
    const token = raw?.startsWith('Bearer ') ? raw.slice(7) : raw;
    accessTokens.delete(token);
    return res.json({ message: 'Logged out successfully' });
});

module.exports = router;
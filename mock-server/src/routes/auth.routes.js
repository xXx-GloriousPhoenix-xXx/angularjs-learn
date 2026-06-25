const { Router } = require('express');
const authService = require('../services/auth.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = Router();

router.post('/register', (req, res) => {
    try {
        authService.register(req.body);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.post('/login', (req, res) => {
    try {
        const tokens = authService.login(req.body);
        res.json(tokens);
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.post('/refresh', (req, res) => {
    try {
        const tokens = authService.refresh(req.body.refresh_token);
        res.json(tokens);
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.post('/logout', requireAuth, (req, res) => {
    const raw = req.headers['token'] || req.headers['authorization'];
    const token = raw?.startsWith('Bearer ') ? raw.slice(7) : raw;

    authService.logout(token);
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
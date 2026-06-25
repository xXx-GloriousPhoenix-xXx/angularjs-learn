const { accessTokens } = require('../utils/tokens');

function requireAuth(req, res, next) {
    const raw = req.headers['token'] || req.headers['authorization'];
    const token = raw?.startsWith('Bearer ') ? raw.slice(7) : raw;

    if (!token) {
        return res.status(401).json({ error: 'Missing access token' });
    }

    const username = accessTokens.get(token);
    if (!username) {
        return res.status(401).json({ error: 'Invalid or expired access token' });
    }

    req.username = username;
    next();
}

module.exports = { requireAuth };
const { accessTokens } = require('../utils/tokens');

function requireAuth(req, res, next) {
    const raw   = req.headers['token'] || req.headers['authorization'];
    const token = raw?.startsWith('Bearer ') ? raw.slice(7) : raw;

    if (!token || !accessTokens.has(token)) {
        return res.status(401).json({ error: 'Unauthorized: invalid or missing token' });
    }
    req.username = accessTokens.get(token);
    next();
}

module.exports = { requireAuth };
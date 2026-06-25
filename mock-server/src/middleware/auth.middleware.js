const tokenRepository = require('../repositories/token.repository');

function requireAuth(req, res, next) {
    try {
        const raw = req.headers['token'] || req.headers['authorization'];
        const token = raw?.startsWith('Bearer ') ? raw.slice(7) : raw;

        if (!token) {
            return res.status(401).json({ error: 'Missing access token' });
        }

        const username = tokenRepository.getUsernameByAccessToken(token);
        if (!username) {
            return res.status(401).json({ error: 'Invalid or expired access token' });
        }

        req.username = username;
        next();
    } catch (err) {
        console.error('Error in requireAuth middleware:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { requireAuth };
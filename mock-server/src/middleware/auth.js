const { accessTokens } = require('../utils/tokens');
function requireAuth(req, res, next) {
    const raw   = req.headers['token'] || req.headers['authorization'];
    const token = raw?.startsWith('Bearer ') ? raw.slice(7) : raw;

    console.log('--- requireAuth debug ---');
    console.log('URL:', req.method, req.originalUrl);
    console.log('raw header:', raw);
    console.log('extracted token:', token);
    console.log('token exists in accessTokens:', token ? accessTokens.has(token) : 'no token');
    console.log('current accessTokens size:', accessTokens.size);

    if (!token || !accessTokens.has(token)) {
        return res.status(401).json({ error: 'Unauthorized: invalid or missing token' });
    }
    req.username = accessTokens.get(token);
    next();
}
module.exports = { requireAuth };
const crypto = require('crypto');

// Access/refresh tokens are intentionally NOT persisted to disk — they're
// meant to be short-lived and regenerated on login/refresh, so in-memory
// Maps are the right tool here (unlike users/profiles/posts, which need
// to survive a server restart).
const accessTokens = new Map();  // token -> username
const refreshTokens = new Map(); // token -> username

function issueTokenPair(username) {
    const accessToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');

    accessTokens.set(accessToken, username);
    refreshTokens.set(refreshToken, username);

    return { access_token: accessToken, refresh_token: refreshToken };
}

module.exports = {
    accessTokens,
    refreshTokens,
    issueTokenPair,
};
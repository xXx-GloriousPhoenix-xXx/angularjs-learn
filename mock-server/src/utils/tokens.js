const { generateToken } = require('./crypto');
const { users }         = require('./users-store');

const accessTokens  = new Map(); // accessToken  -> username
const refreshTokens = new Map(); // refreshToken -> username

function issueTokenPair(username) {
    const access_token  = generateToken();
    const refresh_token = generateToken();
    accessTokens.set(access_token, username);
    refreshTokens.set(refresh_token, username);
    return { access_token, refresh_token };
}

module.exports = { users, accessTokens, refreshTokens, issueTokenPair };
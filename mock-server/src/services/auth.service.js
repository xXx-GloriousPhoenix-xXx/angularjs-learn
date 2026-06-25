const { hashPassword } = require('../utils/crypto');
const userRepository = require('../repositories/user.repository');
const tokenRepository = require('../repositories/token.repository');
const crypto = require('crypto');

class AuthError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

function issueTokenPair(username) {
    const accessToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');

    tokenRepository.setAccessToken(accessToken, username);
    tokenRepository.setRefreshToken(refreshToken, username);

    return { access_token: accessToken, refresh_token: refreshToken };
}

function register({ username, email, password }) {
    if (!username || !email || !password) {
        throw new AuthError('username, email and password are required', 400);
    }

    if (userRepository.exists(username)) {
        throw new AuthError('Username already taken', 409);
    }

    userRepository.create({
        username,
        email,
        passwordHash: hashPassword(password),
    });
}

function login({ username, password }) {
    if (!username || !password) {
        throw new AuthError('username and password are required', 400);
    }

    const user = userRepository.findByUsername(username);
    if (!user || user.passwordHash !== hashPassword(password)) {
        throw new AuthError('Invalid username or password', 400);
    }

    return issueTokenPair(username);
}

function refresh(refreshToken) {
    if (!refreshToken) {
        throw new AuthError('refresh_token is required', 400);
    }

    const username = tokenRepository.getUsernameByRefreshToken(refreshToken);
    if (!username) {
        throw new AuthError('Invalid or expired refresh_token', 403);
    }

    refreshTokens.delete(refreshToken);
    return issueTokenPair(username);
}

function logout(token) {
    accessTokens.delete(token);
}

module.exports = {
    AuthError,
    register,
    login,
    refresh,
    logout,
};
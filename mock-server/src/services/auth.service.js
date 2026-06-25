const { hashPassword } = require('../utils/crypto');
const { accessTokens, refreshTokens, issueTokenPair } = require('../utils/tokens');
const userRepository = require('../repositories/user.repository');

class AuthError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
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

    const username = refreshTokens.get(refreshToken);
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
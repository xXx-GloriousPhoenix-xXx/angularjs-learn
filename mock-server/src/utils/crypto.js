const crypto = require('crypto');

/**
 * Simple SHA-256 password hashing. This is a MOCK server — fine for local
 * development/testing, but never use plain SHA-256 for real user passwords
 * in production (use bcrypt/argon2 with a per-user salt instead).
 */
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = { hashPassword };
const crypto = require('crypto');

function generateTokens() {
    const accessToken = crypto.randomBytes(12).toString('hex');
    const refreshToken = crypto.randomBytes(12).toString('hex');
    return { accessToken, refreshToken };
}

module.exports = { generateTokens };

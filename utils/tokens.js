const crypto = require('crypto');

// Secret expiration time (in milliseconds)
const ACCESS_TOKEN_EXPIRATION = 60 * 60 * 1000;  
const REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000;  // 7 days

const generateTokens = () => {
    // Generate the access token (32-byte random token)
    const accessToken = crypto.randomBytes(32).toString('hex');
    // Generate the refresh token (64-byte random token)
    const refreshToken = crypto.randomBytes(64).toString('hex');

    console.log("Generated access token:", accessToken);
    console.log("Generated refresh token:", refreshToken);

    // Set the expiration timestamps
    const accessTokenExpiresAt = Date.now() + ACCESS_TOKEN_EXPIRATION;
    const refreshTokenExpiresAt = Date.now() + REFRESH_TOKEN_EXPIRATION;

    return {
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt
    };
};

module.exports = { generateTokens };


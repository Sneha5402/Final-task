const crypto = require('crypto');

// Expiration time constants
const ACCESS_TOKEN_EXPIRATION = 1 * 60 * 1000;  // 1 minute
const REFRESH_TOKEN_EXPIRATION = 2 * 60 * 1000;  // 2 minutes

const generateTokens = (user) => {
    const currentTime = Date.now();

    if (user.accessTokenExpiresAt > currentTime && user.refreshTokenExpiresAt > currentTime) {
        return {
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            accessTokenExpiresAt: user.accessTokenExpiresAt,
            refreshTokenExpiresAt: user.refreshTokenExpiresAt
        };
    }

    // Tokens are expired, generate new ones
    const accessToken = crypto.randomBytes(16).toString('hex');
    const refreshToken = crypto.randomBytes(16).toString('hex');
    console.log("Generated access token:", accessToken);
    console.log("Generated refresh token:", refreshToken);

    // Set the expiration timestamps for the new tokens
    const accessTokenExpiresAt = Date.now() + ACCESS_TOKEN_EXPIRATION;
    const refreshTokenExpiresAt = Date.now() + REFRESH_TOKEN_EXPIRATION;

    // Update the user with the new tokens and expiration times
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    user.accessTokenExpiresAt = accessTokenExpiresAt;
    user.refreshTokenExpiresAt = refreshTokenExpiresAt;
    user.save(); 

    return {
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt
    };
};


module.exports = { generateTokens };

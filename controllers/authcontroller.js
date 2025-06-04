const User = require('../models/user');
const bcrypt = require('bcrypt');
const { generateTokens } = require('../utils/tokens');
const logger = require('../utils/logger'); 

// Signup
const signup = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        logger.warn('Signup attempt failed: Passwords do not match');
        return res.status(400).json({
            status: 'error',
            message: 'Passwords do not match',
        });
    }

    try {
        const newUser = await User.create({
            username,
            email,
            password,
        });
        console.log('User created:', newUser);
        res.status(201).json({
            status: 'success',
            message: 'User successfully registered',
            redirect: '/login',
        });
    } catch (error) {
        logger.error(`Signup failed for ${email}: ${error.message}`);
        res.status(409).json({
            status: 'error',
            message: 'User already exists',
        });
    }
};

// Login
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        logger.warn('Login attempt failed: Missing email or password');
        return res.status(400).json({
            status: 'error',
            message: 'Email and password are required',
        });
    }

    try {
        const user = await User.findOne({ where: { email, isDeleted: 0 } });

        if (!user) {
            logger.warn(`Login attempt failed: User not found (${email})`);
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            logger.warn(`Login attempt failed: Invalid password (${email})`);
            return res.status(401).json({
                status: 'error',
                message: 'Invalid password',
            });
        } else {
            const { accessToken, refreshToken } = generateTokens();

            // Set tokens as cookies
            res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 1 * 60 * 1000 });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
            res.cookie('userid', user.userid, { httpOnly: true });

            logger.info(`User logged in: ${email}`);
            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                redirect: '/todo',
            });
        }
    } catch (error) {
        logger.error(`Error during login (${email}): ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Error during login, please try again later',
        });
    }
};

// RefreshToken
const isValidRefreshToken = (token) => {
    try {
        return typeof token === 'string' && token.length > 0;
    } catch (error) {
        console.error('Invalid refresh token:', error);
        return false;
    }
};

const refreshToken = (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        logger.warn('Token refresh failed: No refresh token provided');
        return res.status(401).json({
            status: 'error',
            message: 'Refresh token is required',
            data: null,
        });
    }

    try {
        if (!isValidRefreshToken(refreshToken)) {
            logger.warn('Token refresh failed: Invalid refresh token');
            return res.status(403).json({
                status: 'error',
                message: 'Invalid refresh token',
                data: null,
            });
        }

        const { refreshToken: newRefreshToken } = generateTokens();

        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

        logger.info('Refresh token successfully refreshed');
        res.status(200).json({
            status: 'success',
            message: 'Token refreshed',
        });
    } catch (error) {
        logger.error(`Error during token refresh: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while processing the refresh token',
        });
    }
};

// Logout
const logout = (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        logger.warn('Logout failed: No refresh token provided');
        return res.status(400).json({
            status: "failure",
            message: "Refresh token is required for logout"
        });
    } else {
        logger.info('User logged out successfully');
        res.redirect('/login');
    }
};

module.exports = {
    signup,
    login,
    refreshToken,
    logout
};

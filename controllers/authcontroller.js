const User = require('../models/user');
const bcrypt = require('bcrypt');
const { generateTokens } = require('../utils/tokens');

// Signup
const signup = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({
            status: 'error',
            message: 'Passwords do not match',
        });
    }
    try {
        // Save user data to the database
        const newUser = await User.create({
            username,
            email: email,
            password,
        });
        console.log('User created:', newUser);
        res.status(201).json({
            status: 'success',
            message: 'User successfully registered',
            redirect: '/login',
        });
    } catch (error) {
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
        return res.status(400).json({
            status: 'error',
            message: 'Email and password are required',
        });
    }

    try {
        const user = await User.findOne({ where: { email, isDeleted: 0 } });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid password',
            });
        } else {
            // Generate tokens
            const { accessToken, refreshToken } = generateTokens();

            // Set tokens as cookies
            res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 1 * 60 * 1000 });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
            res.cookie('userid', user.userid, { httpOnly: true });

            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                redirect: '/todo',
            });
        }
    } catch (error) {
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
        return res.status(401).json({
            status: 'error',
            message: 'Refresh token is required',
            data: null,
        });
    }

    try {
        if (!isValidRefreshToken(refreshToken)) {
            return res.status(403).json({
                status: 'error',
                message: 'Invalid refresh token',
                data: null,
            });
        }

        const { refreshToken: newRefreshToken } = generateTokens();

        // Set the new token as a cookie
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

        console.log('Tokens refreshed successfully');
        return res.status(200).json({
            status: 'success',
            message: 'Token refreshed',
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'An error occurred while processing the refresh token',
        });
    }
};

const logout = (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(400).json({
            status: "failure",
            message: "Refresh token is required for logout"
        });
    } else{
        res.redirect('/login');
    }
};

module.exports = {
    signup,
    login,
    refreshToken,
    logout
};

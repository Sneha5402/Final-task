// routes/authRoutes.js
const express = require('express');
const { loginUser } = require('../controllers/authController'); 
const { logoutUser } = require('../controllers/authController');  

const router = express.Router();

// POST route for login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const result = await loginUser(username, password);
        
        if (result.error) {
            return res.status(400).json({ error: result.error });
        }
        
        // If login is successful, return user data and tokens
        res.status(200).json({
            message: 'Login successful',
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during login' });
    }
});

// POST route for logout
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'No refresh token provided' });
    }

    try {
        const user = await logoutUser.findOne({ where: { refreshToken } });

        if (!user) {
            return res.status(404).json({ error: 'User not found with this refresh token' });
        }

        await user.update({ refreshToken: null });

        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'An error occurred during logout' });
    }
});


module.exports = router;

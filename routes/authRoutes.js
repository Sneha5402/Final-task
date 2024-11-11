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



// POST route for logout using refresh token
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'No refresh token provided' });
    }

    try {
        // Call the logout function to clear the refresh token from the database
        const result = await logoutUser(refreshToken);

        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        // If logout is successful, send success response
        res.status(200).json({ message: result.message });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during logout' });
    }
});

module.exports = router;

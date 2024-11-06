// routes/authRoutes.js
const express = require('express');
const { loginUser } = require('../controllers/authController'); // Adjust as needed

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

module.exports = router;

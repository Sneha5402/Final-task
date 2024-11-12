const bcrypt = require('bcryptjs');
const User = require('../models/user'); 
const { generateTokens } = require('../utils/tokens');   

// Function to login user
const loginUser = async (username, password) => {
    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            console.log('User not found');
            return { error: 'User not found' };
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log('Invalid password');
            return { error: 'Invalid password' }; 
        }

        const { accessToken, refreshToken } = generateTokens();

        await user.update({ refreshToken });

        console.log('User logged in successfully');
        return { user, accessToken, refreshToken };  
        
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

// Function to log out the user using refresh token
const logoutUser = async (refreshToken) => {
    try {
        const user = await User.findOne({ where: { refreshToken } });

        if (!user) {
            return { error: 'User not found with this refresh token' };
        }

        // Clear the refresh token from the user record in the database
        await user.update({ refreshToken: null });

        console.log('User logged out successfully');
        return { message: 'User logged out successfully' };
    } catch (error) {
        console.error('Error during logout:', error);
        throw error;  
    }
};




module.exports = { loginUser , logoutUser};

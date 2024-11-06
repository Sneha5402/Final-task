const bcrypt = require('bcryptjs');
const User = require('../models/user');  // Adjust as needed for your User model
const { generateTokens } = require('../utils/tokens');   // Assuming you generate tokens on successful login

// Function to login user
const loginUser = async (username, password) => {
    try {
        // Find the user by their username
        const user = await User.findOne({ where: { username } });

        // If user doesn't exist, return an error
        if (!user) {
            console.log('User not found');
            return { error: 'User not found' };
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log('Invalid password');
            return { error: 'Invalid password' }; // Invalid password
        }

        // If password matches, generate and return new tokens
        const { accessToken, refreshToken } = generateTokens();

        // Optionally, update the user's refresh token in the database
        await user.update({ refreshToken });

        console.log('User logged in successfully');
        return { user, accessToken, refreshToken };  // Return user and tokens on successful login
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

module.exports = { loginUser };

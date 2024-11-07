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

module.exports = { loginUser };

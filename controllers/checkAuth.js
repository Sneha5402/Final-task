const User = require('../models/user');

const checkAuth = async (req, res, next) => {
    const { accessToken, userid } = req.cookies;

    if (!accessToken || !userid) {
        const user = await User.findByPk(userid);
        if (user) {
            user.refreshToken = null;
            user.accessToken = null;
            await user.save();
        }
        
        return res.redirect('/login'); 
    }
    
    next();
};

module.exports = checkAuth;

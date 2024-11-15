const User = require('../models/user');

async function checkAuth(req, res, next) {
    const { accessToken } = req.cookies;

    if (!accessToken) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findOne({ where: { refreshToken: req.cookies.refreshToken } });
        if (!user) {
            return res.redirect('/login');
        }
        // Token is valid; attach user ID to the request
        req.userid = user.userid;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).send('Unauthorized');
    }
}

module.exports = checkAuth;

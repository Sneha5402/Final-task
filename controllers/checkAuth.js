const User = require('../models/user');

async function checkAuth(req, res, next) {
    console.log('Middleware: Checking auth...');
    const { accessToken, userid } = req.cookies;

    if (!accessToken || !userid) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const user = await User.findOne({ where: { refreshToken: req.cookies.refreshToken } });
        if (!user) {
            return res.redirect('/login');
        }
        // Token is valid; attach user ID to the request
        req.userid = user.userid;
        console.log('Middleware: User is authorized, userID:', userid);
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).send('Unauthorized');
    }
}

module.exports = checkAuth;

const User = require('../models/user');

async function checkAuth(req, res, next) {
    const { accessToken, userid } = req.cookies;

    if (!accessToken || !userid) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const user = await User.findOne({ where: { refreshToken: req.cookies.refreshToken } });
        if (!user) {
            return res.redirect('/login');
        }
        req.userid = user.userid;
        next();
    } catch (error) {
        res.status(401).send('Unauthorized');
    }
}

module.exports = checkAuth;

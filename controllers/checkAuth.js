const User = require('../models/user');

async function checkAuth(req, res, next) {
    const {  userid } = req.cookies;

    if (!userid) {
        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized'
        });
    }
    try {
        const user = await User.findOne({ where: { userid: req.cookies.userid } });
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

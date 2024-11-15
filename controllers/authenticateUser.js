const User = require('../models/user');

const authenticateUser = async (req, res, next) => {
    const userId = req.cookies.userid;

    if (!userId) {
        return res.status(401).send('User not authenticated');
    }

    const user = await User.findOne({ where: { userid: userId } });

    if (!user) {
        return res.status(401).send('User not found');
    }

    req.userid = userId;

    next(); 
};

module.exports = authenticateUser;

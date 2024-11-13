const authenticateUser = (req, res, next) => {
    const userid = req.cookies.userid;
    console.log('userId from cookie:', userid); 

    if (!userid) {
        return res.status(401).redirect('/login');
    }

    req.userid = userid; 
    next();
};

module.exports = authenticateUser;

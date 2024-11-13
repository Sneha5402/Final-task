const checkAuth = (req, res, next) => {
    // Check if the accessToken is present in the cookies
    const { accessToken } = req.cookies;
    console.log('Checking access token:', accessToken); // Debugging log

    // If the accessToken is missing, redirect to the login page
    if (!accessToken) {
        return res.redirect('/login');
    }

    // Proceed to the next middleware/route handler if the token exists
    next();
};

module.exports = checkAuth;
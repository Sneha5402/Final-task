const cors = require('cors');

const corsOption = {
    origin: (origin, callback) => {
        if (!origin || /^http:\/\/localhost(:[0-9]+)?$/.test(origin)) {
            callback(null, true); 
        } else {
            callback(new Error('CORS error: Not allowed by CORS policy')); 
        }
    },
    optionsSuccessStatus: 200
};

const corsMiddleware = (req, res, next) => {
    cors(corsOption)(req, res, (err) => {
        if (err) {
            return res.status(403).json({ message: err.message });
        }
        next();
    });
};

module.exports = corsMiddleware;
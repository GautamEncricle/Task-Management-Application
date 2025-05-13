const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    }
    else if (req.headers.authorization?.startsWith(`Bearer`)) {
        token = req.headers.authorization.split(" ")[1];
    }
    else {
        return res.status(401).json({
            statusCode: 'Failed',
            message: 'Failed to login'
        })
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decode.id).select('+password');
        next();
    }
    catch (err) {
        res.status(401).json({
            statusCode: "failed",
            message: "Invalid token"
        });
    }
}

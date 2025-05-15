const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const createToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;

    const checkUser = await User.findOne({ email });
    if (checkUser) return res.status(400).json({ statusCode: 'failed', message: 'Email already in use' });

    const user = await User.create({ name, email, password });
    const token = createToken(user._id);

    if (!token) {
        return next(new AppError("Something went wrong!", 500));
    }
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 3 * 24 * 60 * 60 * 1000
    })
    res.status(201).json({
        statusCode: 'Success',
        message: 'User successfully created'
    })

})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new AppError("User no longer exists", 404))
    }

    //compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new AppError("User or Password invalid", 401))
    }

    const token = createToken(user._id);
    if (!token) {
        return next(new AppError("Something went wrong!", 500));
    }
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 3 * 24 * 60 * 60 * 1000
    })
    res.status(201).json({
        statusCode: 'Success',
        message: 'User successfully Login',
        token: token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    })
})
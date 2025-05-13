const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const createToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const checkUser = await User.findOne({ email });
        if (checkUser) return res.status(400).json({ statusCode: 'failed', message: 'Email already in use' });

        const user = await User.create({ name, email, password });
        const token = createToken(user._id);

        if (!token) {
            return res.status(505).json({
                statusCode: 'Error',
                message: 'Something went wrong!'
            })
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
    }
    catch (error) {
        res.status(505).json({
            statusCode: "Error",
            error: `Something went wrong ${error}`
        })
    }
}

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                statusCode: 'Failed',
                message: "User not longer exists"
            })
        }

        //compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                statusCode: 'Failed',
                message: "User or Password invalid"
            })
        }

        const token = createToken(user._id);
        if (!token) {
            return res.status(505).json({
                statusCode: 'Error',
                message: 'Something went wrong!'
            })
        }
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            maxAge: 3 * 24 * 60 * 60 * 1000
        })
        res.status(201).json({
            statusCode: 'Success',
            message: 'User successfully Login'
        })
    }
    catch (error) {
        res.status(505).json({
            statusCode: "Error",
            error: `Something went wrong ${error}`
        })
    }
}
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,  
        required: [true, 'Name is required'] 
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,  
        validate: {
            validator: function (email) { 
                return validator.isEmail(email);
            },
            message: (props) => `${props.value} is not a valid email`  
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 4,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'pending'
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const User = mongoose.model('User', userSchema);  
module.exports = User;

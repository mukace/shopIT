const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        maxlength: [30, 'Name can not exceed 30 charachters'],
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: [validator.isEmail, 'please enter valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, 'Your password must be longer than 6 charachters'],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: 'user'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

// hashing the password before saving user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) next();

    this.password = await bcrypt.hash(this.password, 10);
});

// get JWT
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

// compare password
userSchema.methods.comparePassword = async function (suppliedPassword) {
    return await bcrypt.compare(suppliedPassword, this.password)
}

// genrate password recovery token
userSchema.methods.getResetPasswordToken = function () {
    // genrate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // hashing and saving token in database 
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // setting token expire time
    this.resetPasswordExpire = Date.now() + 10 * 60 * 100;

    return resetToken;
}

module.exports = mongoose.model('User', userSchema);
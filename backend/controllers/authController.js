const ErrorHandler = require('../config/errorHandler');
const sendToken = require('../utils/jwt');
const { sendEmail } = require('../utils/sendEmail');
const User = require('./../models/User');
const crypto = require('crypto');

// Register a user -> /api/v1/register
exports.registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body
        const user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: 'xyz',
                url: 'xyz'
            }
        })

        sendToken(user, 200, res);
    } catch (error) {
        next(error)
    }
}

// Login a user -> /api/v1/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // check if email and password supplied
        if (!email || !password) {
            return next(new ErrorHandler('Please provide email & password', 400));
        }

        // finding user in database
        const user = await User.findOne({ email: email }).select('+password');

        if (!user) return next(new ErrorHandler('Invalid credentials', 401));

        // check if password is corrrect or not
        const isPasswordMatched = await user.comparePassword(password);

        if (!isPasswordMatched) return next(new ErrorHandler('Invalid credentials', 401));

        sendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
}

// logout the user -> /api/v1/logout
exports.logout = async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Logged out'
    })
}

// Forgot password -> /api/v1/forgotPassword
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) return next(new ErrorHandler('email not found', 404));

        // get reset token and add it to user
        const resetToken = user.getResetPasswordToken();
        
        // save the user in database
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;

        const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`

        // inner TRY-CATCH block
        try {
            await sendEmail({
                email: user.email,
                subject: 'SHOPIT ACCOUNT SETUP',
                message
            });

            res.status(200).json({
                success: true,
                message: `Email sent to ${user.email}`
            });
            
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            next(error);
        }

    } catch (error) {
        next(error);
    }
}

// Reset password -> /api/v1/resetPassword/:token
exports.resetPassword = async (req, res, next) => {
    try {
        // hash url token
        const haxToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        
        const user = await User.findOne({
            resetPasswordToken: haxToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return next(new ErrorHandler(`Invalid or expired password token`, 400));

        if (req.body.password !== req.body.confirmPassword) {
            return next(new ErrorHandler(`Passwords do not match`, 400));
        }

        // setup new password
        user.password = req.body.password;

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        sendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
}
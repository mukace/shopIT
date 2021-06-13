const ErrorHandler = require('../config/errorHandler');
const sendToken = require('../utils/jwt');
const User = require('./../models/User');

// get logged in user details -> /api/v1/me
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
}

// update/change password -> /api/v1/updatePassword
exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // confirm user password is correct or not
        const passwordMatched = await user.comparePassword(req.body.currentPassword);

        if (!passwordMatched) return next(new ErrorHandler(`Current password is wrong`, 400));

        user.password = req.body.newPassword;

        await user.save();

        sendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
}

// update user data -> /api/v1/me/update
exports.updateProfile = async (req, res, next) => {
    try {
        const newUserData = {
            name: req.body.name,
            email: req.body.email
        }
    
        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })
    
        res.status(200).json({ success: true });
    } catch (error) {
        next(error)
    }
}

// get all users(Admin) -> /api/v1/admin/users
exports.allUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        next(error);
    }
}

// get single user profile(Admin) -> /api/v1/admin/user/:id
exports.getUserDetails = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
    
        if (!user) {
            return next(new ErrorHandler(`User doesn't exists with ID: ${req.params.id}`, 400));
        }
    
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error)
    }
}

// update a user profile(Admin) -> /api/v1/admin/updateUser/:id
exports.updateUser = async (req, res, next) => {
    try {
        const newUserData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role
        }
    
        const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        if (!user) {
            return next(new ErrorHandler(`User doesn't exists with ID: ${req.params.id}`, 400));
        };
    
        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
}

// delete a user profile(Admin) -> /api/v1/admin/delete/:id
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return next(new ErrorHandler(`User doesn't exists with ID: ${req.params.id}`, 400));
        };

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
}

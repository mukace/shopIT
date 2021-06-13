const jwt = require('jsonwebtoken');
const ErrorHandler = require("../config/errorHandler");
const User = require('../models/User');

// check user authentication
exports.isAuthenticatedUser = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) return next(new ErrorHandler('Login first to access the resource', 401));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        next();

    } catch (error) {
        next(error);
    }
}

// handling user roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`${req.user.role}s can not access this resource`, 403))
        }
        next();
    }
}

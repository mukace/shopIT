const ErrorHandler = require('./../config/errorHandler');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV == 'DEVELOPMENT') {
        console.log(err);
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: err,
            errorStack: err.stack,
            errorName: err.name
        })
    }

    if (process.env.NODE_ENV == 'PRODUCTION') { 
        // wrong object id error
        if (err.name === 'CastError') {
            const message = `Resource not found, invalid ${err.path}`;
            err = new ErrorHandler(message, 400);
        }

        // validation error
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(value => value.message);
            err = new ErrorHandler(message, 400);
        }

        // duplicate key error
        if (err.code === 11000) {
            const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
            err = new ErrorHandler(message, 400);
        }

        // Handling wrong JWT error
        if (err.name === 'JsonWebTokenError') {
            const message = 'JSON Web Token is invalid. Try Again!!!'
            err = new ErrorHandler(message, 400)
        }

        // Handling Expired JWT error
        if (err.name === 'TokenExpiredError') {
            const message = 'JSON Web Token is expired. Try Again!!!'
            err = new ErrorHandler(message, 400)
        }

        res.status(err.statusCode).json({
            success: false,
            message: err.message || 'Internal Server Error'
        })
    }    
}
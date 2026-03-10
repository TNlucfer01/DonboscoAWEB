// middleware/errorHandler.js — Global Express error handler
// i don't understand how this work 
const AppError = require('../utils/AppError');
/// why does the above line is not working 
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
    if (err.isOperational) {
        // Known business-logic error (AppError)
        return res.status(err.statusCode).json({
            success: false,
            error: { code: err.code, message: err.message },
        });
    }

    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        const messages = err.errors.map(e => e.message);
        return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: messages.join(', ') },
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: { code: 'AUTH_FAILED', message: 'Invalid or expired token' },
        });
    }

    // Unknown errors — log + return generic 500
    console.error('[Unhandled Error]', err);
    return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'An unexpected error occurred' },
    });
};

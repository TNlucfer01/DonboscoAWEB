const rateLimit = require('express-rate-limit');

// Limit login attempts: max 5 per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many login attempts. Please try again in 15 minutes.',
        },
    },
});

module.exports = { loginLimiter };

const rateLimit = require('express-rate-limit');

// Limit login attempts per IP.
// Development: 100 per 15 min (avoids lockout during testing).
// Production:  5   per 15 min (brute-force protection).
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 100 : 5,
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

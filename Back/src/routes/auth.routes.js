// src/routes/auth.routes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { loginLimiter, otpLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/login
router.post('/login',
    loginLimiter,
    [
        body('email').isEmail().withMessage('Valid email required'),
        body('password').notEmpty().withMessage('Password required'),
    ],
    validate,
    ctrl.login
);

// POST /api/auth/refresh
router.post('/refresh', ctrl.refresh);

// POST /api/auth/forgot-password
router.post('/forgot-password',
    otpLimiter,
    [body('phone').isMobilePhone().withMessage('Valid phone number required')],
    validate,
    ctrl.forgotPassword
);

// POST /api/auth/verify-otp
router.post('/verify-otp',
    otpLimiter,
    [
        body('phone').isMobilePhone().withMessage('Valid phone number required'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    ],
    validate,
    ctrl.verifyOTP
);

// POST /api/auth/reset-password
router.post('/reset-password',
    otpLimiter,
    [
        body('phone').isMobilePhone().withMessage('Valid phone number required'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
        body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    validate,
    ctrl.resetPassword
);

// POST /api/auth/logout
router.post('/logout', ctrl.logout);

module.exports = router;

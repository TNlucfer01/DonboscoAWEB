// src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const { success } = require('../utils/apiResponse');
// Refresh token cookie: httpOnly, secure in prod, 7-day lifetime
const REFRESH_COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTS);
        return success(res, { token: result.accessToken, user: result.user });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/refresh
// POST /api/auth/refresh — called when access token expires to get a new one
const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) return res.status(401).json({ success: false, error: { code: 'AUTH_FAILED', message: 'No refresh token' } });
        const result = await authService.refreshAccessToken(refreshToken);
        return success(res, result);
    } catch (err) {
        next(err);
    }
};
// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
    try {
        const { phone } = req.body;
        const result = await authService.sendOTP(phone);
        return success(res, result);
    } catch (err) {
        next(err);
    }
};
// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
    try {
        const { phone, otp, newPassword } = req.body;
        const result = await authService.resetPassword(phone, otp, newPassword);
        return success(res, result);
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/logout
const logout = (_req, res) => {
    res.clearCookie('refreshToken');
    return res.json({ success: true, data: { message: 'Logged out' } });
};

module.exports = { login, refresh, forgotPassword, resetPassword, logout };

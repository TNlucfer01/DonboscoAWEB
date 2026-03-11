// src/services/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/index');
const AppError = require('../utils/AppError');

// In-memory OTP store (replace with Redis in production)
const otpStore = new Map(); // phone → { otp, expiresAt }

// ── Login ──────────────────────────────────────────────────────
async function login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new AppError('AUTH_FAILED', 'Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new AppError('AUTH_FAILED', 'Invalid credentials', 401);

    const accessToken = jwt.sign(
        { userId: user.user_id, role: user.role, managedYear: user.managed_year, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '15m' }
    );

    const refreshToken = jwt.sign(
        { userId: user.user_id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );

    return { accessToken, refreshToken, user: { id: user.user_id, name: user.name, role: user.role } };
}

// ── Refresh Token ──────────────────────────────────────────────
async function refreshAccessToken(refreshToken) {
    let payload;
    try {
        payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
        throw new AppError('AUTH_FAILED', 'Invalid or expired refresh token', 401);
    }

    const user = await User.findByPk(payload.userId);
    if (!user) throw new AppError('AUTH_FAILED', 'User not found', 401);

    const accessToken = jwt.sign(
        { userId: user.user_id, role: user.role, managedYear: user.managed_year, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '15m' }
    );
    return { accessToken };
}

// ── Forgot Password (OTP) ──────────────────────────────────────
async function sendOTP(phone) {
    const user = await User.findOne({ where: { phone_number: phone } });
    if (!user) throw new AppError('NOT_FOUND', 'No account with this phone number', 404);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 min

    // TODO: Replace console.log with real MSG91 call (sms.service.js)
    console.log(`[DEV] OTP for ${phone}: ${otp}`);
    return { message: 'OTP sent' };
}

// ── Reset Password ─────────────────────────────────────────────
async function resetPassword(phone, otp, newPassword) {
    const entry = otpStore.get(phone);
    if (!entry || entry.otp !== otp || Date.now() > entry.expiresAt) {
        throw new AppError('OTP_INVALID', 'OTP is invalid or has expired', 400);
    }

    const user = await User.findOne({ where: { phone_number: phone } });
    if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);

    const hash = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash: hash });
    otpStore.delete(phone);

    return { message: 'Password reset successful' };
}

module.exports = { login, refreshAccessToken, sendOTP, resetPassword };

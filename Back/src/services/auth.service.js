// src/services/auth.service.js
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/index');
const AppError = require('../utils/AppError');
const smsService = require('./sms.service');

// In-memory OTP store (replace with Redis in production)
const otpStore = new Map(); // phone → { otp, expiresAt }

// In-memory refresh token blacklist (replace with Redis in production)
const revokedTokens = new Set(); // set of revoked refresh tokens

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
    if (revokedTokens.has(refreshToken)) {
        throw new AppError('AUTH_FAILED', 'Refresh token has been revoked', 401);
    }

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
    // A01: Return user object so frontend can restore user state on page reload
    return { accessToken, user: { id: user.user_id, name: user.name, role: user.role, managedYear: user.managed_year } };
}

// ── Invalidate Refresh Token (logout) ──────────────────────────
function invalidateRefreshToken(token) {
    if (token) revokedTokens.add(token);
}

// ── Forgot Password (OTP) ──────────────────────────────────────
async function sendOTP(phone) {
    const user = await User.findOne({ where: { phone_number: phone } });
    if (!user) throw new AppError('NOT_FOUND', 'No account with this phone number', 404);

    const otp = crypto.randomInt(100000, 1000000).toString(); // CSPRNG — not predictable
    otpStore.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 min

    // Log OTP to console in development for easy testing
    if (process.env.NODE_ENV === 'development') {
        console.log(`[AUTH-DEV] 🔑 OTP for ${phone}: ${otp}`);
    }

    // Send SMS via Fast2SMS (uses FAST_SMS env key)
    await smsService.sendOTPSMS(phone, otp).catch(err => {
        console.error('[AUTH] Failed to deliver OTP via SMS:', err.message);
    });

    return { message: 'OTP sent successfully' };
}

// ── Verify OTP (step 2 validation) ────────────────────────────
// Checks the OTP is correct WITHOUT resetting the password.
// Called by the frontend "Verify OTP" button at step 2.
async function verifyOTP(phone, otp) {
    const entry = otpStore.get(phone);
    if (!entry || entry.otp !== otp || Date.now() > entry.expiresAt) {
        throw new AppError('OTP_INVALID', 'OTP is invalid or has expired', 400);
    }
    return { message: 'OTP verified' };
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

module.exports = { login, refreshAccessToken, invalidateRefreshToken, sendOTP, verifyOTP, resetPassword };
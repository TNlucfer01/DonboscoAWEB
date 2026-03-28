// src/routes/monthlyRegister.routes.js
// Routes for staff monthly attendance register.

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { success } = require('../utils/apiResponse');
const svc = require('../services/monthlyRegister.service');

/**
 * GET /api/monthly-register/subjects
 * Returns distinct subjects the logged-in staff has submitted attendance for.
 * Used to populate the subject dropdown.
 */
router.get('/subjects',
    auth,
    roleGuard('SUBJECT_STAFF'),
    async (req, res, next) => {
        try {
            const data = await svc.getStaffSubjects(req.user.userId);
            return success(res, data);
        } catch (e) { next(e); }
    }
);

/**
 * GET /api/monthly-register?subject_id=&month=YYYY-MM
 * Returns the full monthly register table data.
 */
router.get('/',
    auth,
    roleGuard('SUBJECT_STAFF'),
    async (req, res, next) => {
        try {
            const { subject_id, month } = req.query;
            if (!subject_id || !month) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'subject_id and month (YYYY-MM) are required' }
                });
            }
            const data = await svc.getMonthlyRegister({
                subject_id: Number(subject_id),
                month,
                staffUserId: req.user.userId,
            });
            return success(res, data);
        } catch (e) { next(e); }
    }
);

module.exports = router;

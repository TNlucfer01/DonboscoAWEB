// src/routes/attendanceSummary.routes.js
// Routes for the attendance summary table feature (Principal & YC dashboards).

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { success } = require('../utils/apiResponse');
const svc = require('../services/attendanceSummary.service');

/**
 * GET /api/attendance-summary/year-table
 * Query: date=YYYY-MM-DD, year=1|2|3|4 (optional, YC scoped)
 *
 * Principal → can pass year or get all years.
 * YC        → year is forced to their managedYear.
 */
router.get('/year-table',
    auth,
    roleGuard('PRINCIPAL', 'YEAR_COORDINATOR'),
    async (req, res, next) => {
        try {
            const { date } = req.query;
            if (!date) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'date query param is required (YYYY-MM-DD)' }
                });
            }

            // YC is always scoped to their managed year
            let year = req.query.year || null;
            if (req.user.role === 'YEAR_COORDINATOR') {
                year = req.user.managedYear;
            }

            const data = await svc.getYearSummaryTable({ date, year });
            return success(res, data);
        } catch (e) { next(e); }
    }
);

/**
 * GET /api/attendance-summary/student-detail
 * Query: date=YYYY-MM-DD, year=1|2|3|4, status=ABSENT|PRESENT
 *
 * Returns individual student rows with per-period status.
 * This is the drilldown when a Principal/YC clicks a cell in the table.
 */
router.get('/student-detail',
    auth,
    roleGuard('PRINCIPAL', 'YEAR_COORDINATOR'),
    async (req, res, next) => {
        try {
            const { date, status } = req.query;

            if (!date || !status) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'date and status query params are required' }
                });
            }

            // YC forced to their managed year, Principal can pass any year
            let year = req.query.year;
            if (req.user.role === 'YEAR_COORDINATOR') {
                year = req.user.managedYear;
            }
            if (!year) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'year is required' }
                });
            }

            const data = await svc.getStudentDayDetail({ date, year, status });
            return success(res, data);
        } catch (e) { next(e); }
    }
);

module.exports = router;

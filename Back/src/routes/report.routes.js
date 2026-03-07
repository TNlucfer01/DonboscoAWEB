// src/routes/report.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuaurd');
const { success } = require('../utils/apiResponse');
const { sequelize } = require('../models/index');
const { QueryTypes } = require('sequelize');

// Helper: build year scope for SQL
const yearScope = (currentUser, query) => {
    if (currentUser.role === 'YEAR_COORDINATOR') return currentUser.managedYear;
    return query.year ? Number(query.year) : null;
};

// GET /api/reports/attendance-summary
router.get('/attendance-summary',
    auth, roleGuard('PRINCIPAL', 'YEAR_COORDINATOR'),
    async (req, res, next) => {
        try {
            const year = yearScope(req.user, req.query);
            const params = { semId: req.query.semester_id || null };
            const conditions = ['1=1'];
            if (year) conditions.push(`s.current_year = ${year}`);
            if (params.semId) conditions.push('ar.semester_id = :semId');
            if (req.query.date_from && req.query.date_to) {
                conditions.push(`ar.date BETWEEN '${req.query.date_from}' AND '${req.query.date_to}'`);
            }

            const results = await sequelize.query(`
        SELECT
          s.student_id, s.name, s.roll_number, s.current_year,
          COUNT(ar.record_id) AS total_periods,
          SUM(ar.status IN ('PRESENT','OD','INFORMED_LEAVE')) AS attended,
          ROUND(
            SUM(ar.status IN ('PRESENT','OD','INFORMED_LEAVE')) * 100.0
            / NULLIF(COUNT(ar.record_id), 0), 2
          ) AS attendance_pct
        FROM students s
        LEFT JOIN attendance_records ar ON ar.student_id = s.student_id
        WHERE ${conditions.join(' AND ')}
        GROUP BY s.student_id
        ORDER BY s.current_year, s.roll_number
      `, { replacements: params, type: QueryTypes.SELECT });

            return success(res, results);
        } catch (e) { next(e); }
    }
);

// GET /api/reports/below-threshold
router.get('/below-threshold',
    auth, roleGuard('PRINCIPAL', 'YEAR_COORDINATOR'),
    async (req, res, next) => {
        try {
            const year = yearScope(req.user, req.query);
            const threshold = Number(req.query.threshold) || 80;
            const conditions = ['1=1'];
            if (year) conditions.push(`s.current_year = ${year}`);
            if (req.query.semester_id) conditions.push(`ar.semester_id = ${req.query.semester_id}`);

            const results = await sequelize.query(`
        SELECT
          s.student_id, s.name, s.roll_number, s.current_year, s.parent_phone,
          ROUND(
            SUM(ar.status IN ('PRESENT','OD','INFORMED_LEAVE')) * 100.0
            / NULLIF(COUNT(ar.record_id), 0), 2
          ) AS attendance_pct
        FROM students s
        JOIN attendance_records ar ON ar.student_id = s.student_id
        WHERE ${conditions.join(' AND ')}
        GROUP BY s.student_id
        HAVING attendance_pct < ${threshold}
        ORDER BY attendance_pct ASC
      `, { type: QueryTypes.SELECT });

            return success(res, results);
        } catch (e) { next(e); }
    }
);

// GET /api/reports/by-student/:id
router.get('/by-student/:id',
    auth, roleGuard('PRINCIPAL', 'YEAR_COORDINATOR'),
    async (req, res, next) => {
        try {
            const results = await sequelize.query(`
        SELECT
          ar.date, ar.slot_id, ar.status, ar.od_reason,
          sub.subject_name, ts.slot_number, ts.start_time
        FROM attendance_records ar
        LEFT JOIN subjects sub ON sub.subject_id = ar.subject_id
        LEFT JOIN timetable_slots ts ON ts.slot_id = ar.slot_id
        WHERE ar.student_id = :studentId
        ORDER BY ar.date DESC, ts.slot_number ASC
      `, { replacements: { studentId: req.params.id }, type: QueryTypes.SELECT });

            return success(res, results);
        } catch (e) { next(e); }
    }
);

module.exports = router;

// src/routes/report.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { success } = require('../utils/apiResponse');
const { sequelize } = require('../models/index');
const { QueryTypes } = require('sequelize');

// Helper: build year scope for SQL
const yearScope = (currentUser, query) => {
  if (currentUser.role === 'YEAR_COORDINATOR') return currentUser.managedYear;
  return query.year ? Number(query.year) : null;
};

// GET /api/reports/attendance-summary
// Used by Principal/YC dashboard — summarises each student's attendance %
router.get('/attendance-summary',
  auth, roleGuard('PRINCIPAL', 'YEAR_COORDINATOR'),
  async (req, res, next) => {
    try {
      const year = yearScope(req.user, req.query);
      const replacements = {};
      const conditions = ['1=1'];

      if (year) {
        conditions.push('s.current_year = :year');
        replacements.year = year;
      }
      if (req.query.semester_id) {
        conditions.push('ar.semester_id = :semId');
        replacements.semId = Number(req.query.semester_id);
      }
      if (req.query.date_from && req.query.date_to) {
        conditions.push('ar.date BETWEEN :dateFrom AND :dateTo');
        replacements.dateFrom = req.query.date_from;
        replacements.dateTo = req.query.date_to;
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
      `, { replacements, type: QueryTypes.SELECT });

      return success(res, results);
    } catch (e) { next(e); }
  }
);

// GET /api/reports/below-threshold
// Lists students below a given attendance % (default 80%)
router.get('/below-threshold',
  auth, roleGuard('PRINCIPAL', 'YEAR_COORDINATOR'),
  async (req, res, next) => {
    try {
      const year = yearScope(req.user, req.query);
      const threshold = Number(req.query.threshold) || 80;
      const replacements = { threshold };
      const conditions = ['1=1'];

      if (year) {
        conditions.push('s.current_year = :year');
        replacements.year = year;
      }
      if (req.query.semester_id) {
        conditions.push('ar.semester_id = :semId');
        replacements.semId = Number(req.query.semester_id);
      }

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
        HAVING attendance_pct < :threshold
        ORDER BY attendance_pct ASC
      `, { replacements, type: QueryTypes.SELECT });

      return success(res, results);
    } catch (e) { next(e); }
  }
);

// GET /api/reports/by-student/:id
// Detailed attendance history for a single student (by student_id)
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

// GET /api/reports/subject-wise
// Returns per-student per-subject attendance breakdown for date range + year
router.get('/subject-wise',
  auth, roleGuard('PRINCIPAL', 'YEAR_COORDINATOR'),
  async (req, res, next) => {
    try {
      const year = yearScope(req.user, req.query);
      if (!year) return res.status(400).json({ success: false, error: { message: 'Year is required' } });

      const replacements = { year };
      const conditions = ['s.current_year = :year'];

      if (req.query.date_from && req.query.date_to) {
        conditions.push('ar.date BETWEEN :dateFrom AND :dateTo');
        replacements.dateFrom = req.query.date_from;
        replacements.dateTo = req.query.date_to;
      }

      // 1. Get SUBJECTS for this year
      const subjects = await sequelize.query(`
        SELECT subject_id, subject_name, subject_code
        FROM subjects
        WHERE year = :year
        ORDER BY subject_name
      `, { replacements: { year }, type: QueryTypes.SELECT });

      // 2. Get per-student per-subject attendance
      const records = await sequelize.query(`
        SELECT
          s.student_id, s.name, s.roll_number, s.current_year,
          ar.subject_id,
          COUNT(ar.record_id) AS total_hours,
          SUM(ar.status IN ('PRESENT','OD','INFORMED_LEAVE')) AS present_hours
        FROM students s
        LEFT JOIN attendance_records ar ON ar.student_id = s.student_id
          ${req.query.date_from && req.query.date_to ? 'AND ar.date BETWEEN :dateFrom AND :dateTo' : ''}
        WHERE s.current_year = :year
        GROUP BY s.student_id, ar.subject_id
        ORDER BY s.roll_number, ar.subject_id
      `, { replacements, type: QueryTypes.SELECT });

      // 3. Restructure: per student → per subject stats
      const studentMap = {};
      records.forEach(r => {
        if (!studentMap[r.student_id]) {
          studentMap[r.student_id] = {
            student_id: r.student_id,
            name: r.name,
            roll_number: r.roll_number,
            current_year: r.current_year,
            subjects: {},
          };
        }
        if (r.subject_id) {
          studentMap[r.student_id].subjects[r.subject_id] = {
            total_hours: Number(r.total_hours) || 0,
            present_hours: Number(r.present_hours) || 0,
            percentage: r.total_hours > 0
              ? Math.round((Number(r.present_hours) / Number(r.total_hours)) * 100)
              : 0,
          };
        }
      });

      return success(res, {
        subjects,
        students: Object.values(studentMap),
      });
    } catch (e) { next(e); }
  }
);

module.exports = router;

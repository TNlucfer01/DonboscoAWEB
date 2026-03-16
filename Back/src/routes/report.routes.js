// src/routes/report.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { success } = require('../utils/apiResponse');
const reportSvc = require('../services/report.service');
const { yearScope } = reportSvc;

// GET /api/reports/attendance-summary
// Used by Principal/YC dashboard — summarises each student's attendance %
router.get('/attendance-summary',
  auth, roleGuard('PRINCIPAL', 'YEAR_COORDINATOR'),
  async (req, res, next) => {
    try {
      const year = yearScope(req.user, req.query);
      const results = await reportSvc.getAttendanceSummary({
          year,
          semester_id: req.query.semester_id,
          date_from: req.query.date_from,
          date_to: req.query.date_to
      });
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
      const threshold = req.query.threshold || 80;
      const results = await reportSvc.getBelowThreshold({
          year,
          semester_id: req.query.semester_id,
          threshold
      });
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
      const results = await reportSvc.getByStudent(req.params.id);
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

      const results = await reportSvc.getSubjectWise({
          year,
          semester_id: req.query.semester_id,
          date_from: req.query.date_from,
          date_to: req.query.date_to
      });
      
      return success(res, results);
    } catch (e) { next(e); }
  }
);

module.exports = router;

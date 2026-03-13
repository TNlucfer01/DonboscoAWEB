// src/routes/attendance.routes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { success } = require('../utils/apiResponse');
const svc = require('../services/attendance.service');

// POST /api/attendance/fetch-students — Staff only
router.post('/fetch-students',
    auth, roleGuard('SUBJECT_STAFF', 'PRINCIPAL'),
    [
        body('year').isInt({ min: 1, max: 4 }).withMessage('year required (1–4)'),
        body('batch_id').isInt({ min: 1 }).withMessage('batch_id required'),
        body('batch_type').isIn(['THEORY', 'LAB']).withMessage('batch_type required'),
        body('slot_id').isInt({ min: 1 }).withMessage('slot_id required'),
        body('date').isDate().withMessage('date required (YYYY-MM-DD)'),
    ],
    validate,
    async (req, res, next) => {
        console.log(req.body);
        try { return success(res, await svc.fetchStudents(req.body)); }
        catch (e) { next(e); }
    }
);

// GET /api/attendance/fetch-students-pri — Principal: one row per student with period1–period5
// Query params: year (1-4), date (YYYY-MM-DD)
router.get('/fetch-students-pri',
    auth, roleGuard('PRINCIPAL'),
    async (req, res, next) => {
        try {
            const { year, date,period } = req.query;
            if (!year || !date) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'year and date query params are required' } });
            }
            return success(res, await svc.fetchStudentsPrincipal({ year, date,period }));
        } catch (e) { next(e); }
    }
);

router.post('/save-student-pri',auth,roleGuard('PRINCIPAL'),[],validate,

async (req,res,next)=>{
    try{
        const records=req.body.records;
        console.log(records);
        // return success(res,await svc.saveStudentPri(records));
    return success(res)
    }
    catch(e){next(e);}
})
// POST /api/attendance/submit — Staff only
// Handles multiple students at once via the records[] array.
// Multiple staff can submit for different batches/slots simultaneously.
router.post('/submit',
    auth, roleGuard('SUBJECT_STAFF'),
    [
        body('records').isArray({ min: 1 }).withMessage('records array required'),
        body('slot_id').isInt({ min: 1 }),
        body('date').isDate().withMessage('date required (YYYY-MM-DD)'),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { records, slot_id, date, subject_id } = req.body;
            return success(res, await svc.submit({ records, slot_id, date, subject_id, submitted_by: req.user.userId }));
        } catch (e) { next(e); }
    }
);

// POST /api/attendance/correct-attedance/fetch-students — Staff attendance correction fetching
router.post('/correct-attedance/fetch-students',
    auth, roleGuard('SUBJECT_STAFF', 'PRINCIPAL'),
    [
        body('year').isInt({ min: 1, max: 4 }).withMessage('year required (1–4)'),
        body('batch_id').isInt({ min: 1 }).withMessage('batch_id required'),
        body('batch_type').isIn(['THEORY', 'LAB']).withMessage('batch_type required'),
        body('slot_id').isInt({ min: 1 }).withMessage('slot_id required'),
        body('subject_id').isInt({ min: 1 }).withMessage('subject_id required'),
        body('date').isDate().withMessage('date required (YYYY-MM-DD)'),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { year, batch_id, batch_type, slot_id, subject_id, date } = req.body;
            return success(res, await svc.fetchStaffCorrectionStudents({ year, batch_id, batch_type, slot_id, subject_id, date }));
        } catch (e) { next(e); }
    }
);

// POST /api/attendance/correct-attedance — Staff correct attendance (skips past_date logic)
router.post('/correct-attedance',
    auth, roleGuard('SUBJECT_STAFF'),
    [
        body('records').isArray({ min: 1 }).withMessage('records array required'),
        body('slot_id').isInt({ min: 1 }),
        body('date').isDate().withMessage('date required (YYYY-MM-DD)'),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { records, slot_id, date, subject_id } = req.body;
            return success(res, await svc.correctStaffSubmit({ records, slot_id, date, subject_id, submitted_by: req.user.userId }));
        } catch (e) { next(e); }
    }
);

// GET /api/attendance/view — YC + Principal
router.get('/view', auth, roleGuard('YEAR_COORDINATOR', 'PRINCIPAL'),
    async (req, res, next) => {
        try { return success(res, await svc.view(req.query, req.user)); }
        catch (e) { next(e); }
    }
);

// PUT /api/attendance/correct — Principal only
router.put('/correct',
    auth, roleGuard('PRINCIPAL'),
    [
        body('record_id').isInt({ min: 1 }).withMessage('record_id is required'),
        body('new_status').isIn(['PRESENT', 'ABSENT', 'OD', 'INFORMED_LEAVE']),
    ],
    validate,
    async (req, res, next) => {
        try {
            return success(res, await svc.correct(req.body, req.user.userId));
        } catch (e) { next(e); }
    }
);

// POST /api/attendance/correct-bulk — Principal: bulk upsert (create + update) for all 5 slots
// Each record: { record_id (or null), student_id, slot_id, date, new_status, od_reason? }
router.post('/correct-bulk',
    auth, roleGuard('PRINCIPAL'),
    [
        body('records').isArray({ min: 1 }).withMessage('records array required'),
        body('records.*.student_id').isInt({ min: 1 }),
        body('records.*.slot_id').isInt({ min: 1 }),
        body('records.*.date').isDate(),
        body('records.*.new_status').isIn(['PRESENT', 'ABSENT', 'OD', 'INFORMED_LEAVE']),
    ],
    validate,
    async (req, res, next) => {
        try {
            return success(res, await svc.correctBulk(req.body.records, req.user.userId));
        } catch (e) { next(e); }
    }
);

// OD / IL routes — YC only
router.get('/od-il', auth, roleGuard('YEAR_COORDINATOR', 'PRINCIPAL'), async (req, res, next) => {
    try { return success(res, await svc.listODIL(req.query, req.user)); }
    catch (e) { next(e); }
});

router.post('/od-il',
    auth, roleGuard('YEAR_COORDINATOR'),
    [
        body('student_id').isInt({ min: 1 }),
        body('slot_id').isInt({ min: 1 }),
        body('date').isDate().withMessage('date required (YYYY-MM-DD)'),
        body('status').isIn(['OD', 'INFORMED_LEAVE']),
        body('semester_id').isInt({ min: 1 }),
    ],
    validate,
    async (req, res, next) => {
        try { return success(res, await svc.createODIL(req.body, req.user.userId), 201); }
        catch (e) { next(e); }
    }
);

router.put('/od-il/:id',
    auth, roleGuard('YEAR_COORDINATOR'),
    [
        body('status').isIn(['OD', 'INFORMED_LEAVE']).withMessage('status must be OD or INFORMED_LEAVE'),
        body('od_reason').optional().isString(),
    ],
    validate,
    async (req, res, next) => {
        try { return success(res, await svc.updateODIL(req.params.id, req.body)); }
        catch (e) { next(e); }
    }
);

router.delete('/od-il/:id', auth, roleGuard('YEAR_COORDINATOR'), async (req, res, next) => {
    try { return success(res, await svc.cancelODIL(req.params.id)); }
    catch (e) { next(e); }
});

module.exports = router;

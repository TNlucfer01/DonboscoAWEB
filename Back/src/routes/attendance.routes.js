// src/routes/attendance.routes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuaurd');
const validate = require('../middleware/validate');
const { success } = require('../utils/apiResponse');
const svc = require('../services/attendance.service');

// POST /api/attendance/fetch-students — Staff only
router.post('/fetch-students',
    auth, roleGuard('SUBJECT_STAFF', 'PRINCIPAL'),
    [
        body('year').isInt({ min: 1, max: 4 }).withMessage('year required (1–4)'),//i need to chnage this
        body('batch_id').isInt({ min: 1 }).withMessage('batch_id required'),
        body('batch_type').isIn(['THEORY', 'LAB']).withMessage('batch_type required'),
        body('slot_id').isInt({ min: 1 }).withMessage('slot_id required'), //good  
        body('date').isDate().withMessage('date required (YYYY-MM-DD)'), //not tfor the past dates
    ],
    validate,
    async (req, res, next) => {
        try { return success(res, await svc.fetchStudents(req.body)); }
        catch (e) { next(e); }
    }
);

// POST /api/attendance/submit — Staff only my question is it abl to hande multiple person attendance putting 
router.post('/submit',
    auth, roleGuard('SUBJECT_STAFF', 'PRINCIPAL'), //remove te Principal role 
    [
        body('records').isArray({ min: 1 }).withMessage('records array required'),
        body('slot_id').isInt({ min: 1 }),
        body('date').isDate(),//i need to add the condtion to make sure that this is not past 
    ],
    validate,
    async (req, res, next) => {
        try {
												//is it able to though nopr it can't do that for multiple records 
            const { records, slot_id, date, subject_id } = req.body;
            return success(res, await svc.submit({ records, slot_id, date, subject_id, submitted_by: req.user.userId }));
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
        body('record_id').isInt({ min: 1 }), //why do we need a  new record id 
        body('new_status').isIn(['PRESENT', 'ABSENT', 'OD', 'INFORMED_LEAVE']),
    ],
    validate,
    async (req, res, next) => {
        try {
            return success(res, await svc.correct(req.body, req.user.userId));
        } catch (e) { next(e); }
    }
);

// OD / IL routes — YC only make sure he can't put the attendance for the past days 
router.get('/od-il', auth, roleGuard('YEAR_COORDINATOR', 'PRINCIPAL'), async (req, res, next) => {
    try { return success(res, await svc.listODIL(req.query, req.user)); }
				

				
				
    catch (e) { next(e); }
});

router.post('/od-il',
    auth, roleGuard('YEAR_COORDINATOR'),
    [
        body('student_id').isInt({ min: 1 }),
        body('slot_id').isInt({ min: 1 }),
        body('date').isDate(), // remove the past days 
        body('status').isIn(['OD', 'INFORMED_LEAVE']),
        body('semester_id').isInt({ min: 1 }),
    ],
    validate,
    async (req, res, next) => {
        try { return success(res, await svc.createODIL(req.body, req.user.userId), 201); }
        catch (e) { next(e); }
    }
);

router.put('/od-il/:id', auth, roleGuard('YEAR_COORDINATOR'), async (req, res, next) => {
    try { return success(res, await svc.updateODIL(req.params.id, req.body)); }
    catch (e) { next(e); }
});

router.delete('/od-il/:id', auth, roleGuard('YEAR_COORDINATOR'), async (req, res, next) => {
    try { return success(res, await svc.cancelODIL(req.params.id)); }
    catch (e) { next(e); }
});

module.exports = router;

// src/routes/student.routes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { success } = require('../utils/apiResponse');
const studentService = require('../services/student.service');
const makeController = require('../controllers/crud.controller');

const ctrl = makeController(studentService);

const studentValidation = [
    body('name').notEmpty().withMessage('Student name is required'),
    body('roll_number').notEmpty().withMessage('Roll number is required'),
    body('parent_phone').isMobilePhone().withMessage('Valid parent phone is required'),
    body('current_year').isInt({ min: 1, max: 4 }).withMessage('Year must be 1–4'),
    body('theory_batch_id').isInt({ min: 1 }).withMessage('Valid theory_batch_id is required'),
    body('lab_batch_id').isInt({ min: 1 }).withMessage('Valid lab_batch_id is required'),
];

// Partial validation for PUT — all fields optional but validated if present
const studentUpdateValidation = [
    body('name').optional().notEmpty().withMessage('Student name cannot be empty'),
    body('roll_number').optional().notEmpty().withMessage('Roll number cannot be empty'),
    body('parent_phone').optional().isMobilePhone().withMessage('Valid parent phone is required'),
    body('current_year').optional().isInt({ min: 1, max: 4 }).withMessage('Year must be 1–4'),
    body('theory_batch_id').optional().isInt({ min: 1 }).withMessage('Valid theory_batch_id is required'),
    body('lab_batch_id').optional().isInt({ min: 1 }).withMessage('Valid lab_batch_id is required'),
];

// All student routes — YC and Principal
router.use(auth, roleGuard('YEAR_COORDINATOR', 'PRINCIPAL'));

// Students are looked up by roll_number (not student_id) — :id in the URL is the roll number
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', studentValidation, validate, ctrl.create);
router.put('/:id', studentUpdateValidation, validate, ctrl.update);
router.delete('/:id', ctrl.remove);

// Bulk CSV upload — reserved for future use
router.post('/bulk', async (req, res, next) => {
    try {
        const { students, current_year, theory_batch_id, lab_batch_id } = req.body;
        if (!Array.isArray(students) || !current_year || !theory_batch_id || !lab_batch_id) {
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'students array, current_year, theory_batch_id, and lab_batch_id required' } });
        }
        return success(res, await studentService.bulkCreate(students, current_year, theory_batch_id, lab_batch_id), 201);
    } catch (e) { next(e); }
});

module.exports = router;

// src/routes/student.routes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuaurd');
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
    body('batch_id').isInt({ min: 1 }).withMessage('Valid batch_id is required'),
];

// All student routes — YC and Principal
router.use(auth, roleGuard('YEAR_COORDINATOR', 'PRINCIPAL'));

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', studentValidation, validate, ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

// Bulk CSV upload
router.post('/bulk', async (req, res, next) => {
    try {
        const { students, current_year, batch_id } = req.body;
        if (!Array.isArray(students) || !current_year || !batch_id) {
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'students array, current_year, and batch_id required' } });
        }
        return success(res, await studentService.bulkCreate(students, current_year, batch_id), 201);
    } catch (e) { next(e); }
});

module.exports = router;

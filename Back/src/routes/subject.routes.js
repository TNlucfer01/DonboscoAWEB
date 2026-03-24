// src/routes/subject.routes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const makeController = require('../controllers/crud.controller');
const subjectService = require('../services/subject.service');

const ctrl = makeController(subjectService);

const subjectValidation = [
    body('subject_code').notEmpty().withMessage('Subject code is required'),
    body('subject_name').notEmpty().withMessage('Subject name is required'),
    body('subject_year').isInt({ min: 1, max: 4 }).withMessage('Subject year must be 1–4'),
    body('credits').isInt({ min: 1 }).withMessage('Credits must be a positive integer'),
    body('semester').isIn(['ODD', 'EVEN']).withMessage('Semester must be ODD or EVEN'),
];

// GET: all authenticated (staff needs subjects list for attendance)
router.get('/', auth, ctrl.getAll);

router.get('/:id', auth, ctrl.getById);

// Write: Principal only
router.post('/', auth, roleGuard('PRINCIPAL'), subjectValidation, validate, ctrl.create);

router.put('/:id', auth, roleGuard('PRINCIPAL'), subjectValidation, validate, ctrl.update);
//the below routes has  some issue 
//
router.delete('/:id', auth, roleGuard('PRINCIPAL'), ctrl.remove);

module.exports = router;

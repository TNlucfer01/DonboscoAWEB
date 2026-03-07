// src/routes/batch.routes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuaurd');
const validate = require('../middleware/validate');
const makeController = require('../controllers/crud.controller');
const batchService = require('../services/batch.service');

const ctrl = makeController(batchService);

const batchValidation = [
    body('name').notEmpty().withMessage('Batch name is required'),
    body('batch_type').isIn(['THEORY', 'LAB']).withMessage('batch_type must be THEORY or LAB'),
    body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be 1–4'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
];

// GET: all authenticated users can see batches (needed for attendance step 2)
router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, ctrl.getById);

// Write: Principal only
router.post('/', auth, roleGuard('PRINCIPAL'), batchValidation, validate, ctrl.create);
router.put('/:id', auth, roleGuard('PRINCIPAL'), batchValidation, validate, ctrl.update);
router.delete('/:id', auth, roleGuard('PRINCIPAL'), ctrl.remove);

module.exports = router;

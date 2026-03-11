// src/routes/batch.routes.js
const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { success } = require('../utils/apiResponse');
const batchService = require('../services/batch.service');

const batchValidation = [
    body('name').notEmpty().withMessage('Batch name is required'),
    body('batch_type').isIn(['THEORY', 'LAB']).withMessage('batch_type must be THEORY or LAB'),
    body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be 1–4'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
];

const batchTypeValidation = [
    query('batch_type').isIn(['THEORY', 'LAB']).withMessage('batch_type query parmeter must be THEORY or LAB'),
];

router.get('/', auth, async (req, res, next) => {
    try { return success(res, await batchService.getAll(req.query)); }
    catch (e) { next(e); }
});


router.get('/:id', auth, batchTypeValidation, validate, async (req, res, next) => {
    try { return success(res, await batchService.getById(req.params.id, req.query.batch_type)); }
    catch (e) { next(e); }
});

router.post('/', auth, roleGuard('PRINCIPAL'), batchValidation, validate, async (req, res, next) => {
    try { return success(res, await batchService.create(req.body), 201); }
    catch (e) { next(e); }
});

router.put('/:id', auth, roleGuard('PRINCIPAL'), batchValidation, validate, async (req, res, next) => {
    try { return success(res, await batchService.update(req.params.id, req.body.batch_type, req.body)); }
    catch (e) { next(e); }
});

router.delete('/:id', auth, roleGuard('PRINCIPAL'), batchTypeValidation, validate, async (req, res, next) => {
    try { return success(res, await batchService.remove(req.params.id, req.query.batch_type)); }
    catch (e) { next(e); }
});

module.exports = router;

// src/routes/semester.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuaurd');
const { success } = require('../utils/apiResponse');
const semService = require('../services/semester.service');

// GET /api/semesters — accessible to all authenticated users
router.get('/', auth, async (req, res, next) => {
    try { return success(res, await semService.getAll()); }
    catch (e) { next(e); }
});

// PUT /api/semesters/:id/activate — Principal only
router.put('/:id/activate', auth, roleGuard('PRINCIPAL'), async (req, res, next) => {
    try { return success(res, await semService.activate(req.params.id)); }
    catch (e) { next(e); }
});

module.exports = router;

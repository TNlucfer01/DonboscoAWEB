// src/routes/audit.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { success } = require('../utils/apiResponse');
const auditSvc = require('../services/audit.service');

// GET /api/audit — Principal only, filter by date range
router.get('/',
    auth, roleGuard('PRINCIPAL'),
    async (req, res, next) => {
        try {
            return success(res, await auditSvc.getLogs(req.query));
        } catch (e) { next(e); }
    }
);

module.exports = router;

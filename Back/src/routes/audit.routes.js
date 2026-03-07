// src/routes/audit.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuaurd');
const { success } = require('../utils/apiResponse');
const { AttendanceAuditLog, AttendanceRecord, Student, User } = require('../models/index');
const { Op } = require('sequelize');

// GET /api/audit — Principal only, filter by date range
router.get('/',
    auth, roleGuard('PRINCIPAL'),
    async (req, res, next) => {
        try {
            const where = {};
            if (req.query.date_from && req.query.date_to) {
                where.changed_at = { [Op.between]: [req.query.date_from, req.query.date_to] };
            }
            const logs = await AttendanceAuditLog.findAll({
                where,
                include: [
                    {
                        model: AttendanceRecord, as: 'record',
                        include: [{ model: Student, as: 'student', attributes: ['name', 'roll_number'] }],
                        attributes: ['date', 'slot_id'],
                    },
                    { model: User, as: 'changedBy', attributes: ['name', 'role'] },
                ],
                order: [['changed_at', 'DESC']],
                limit: 500,
            });
            return success(res, logs);
        } catch (e) { next(e); }
    }
);

module.exports = router;

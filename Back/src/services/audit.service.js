// src/services/audit.service.js
const { AttendanceAuditLog, AttendanceRecord, Student, User } = require('../models/index');
const { Op } = require('sequelize');

async function getLogs(query) {
    const where = {};
    if (query.date_from && query.date_to) {
        // F03: Pad date_to to end of day so single-day filters work correctly
        where.changed_at = { [Op.between]: [`${query.date_from} 00:00:00`, `${query.date_to} 23:59:59`] };
    }

    return AttendanceAuditLog.findAll({
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
        limit: 2000, // F01: Increased from 500
    });
}

module.exports = { getLogs };

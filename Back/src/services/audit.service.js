// src/services/audit.service.js
const { AttendanceAuditLog, AttendanceRecord, Student, User } = require('../models/index');
const { Op } = require('sequelize');

async function getLogs(query) {
    const where = {};
    if (query.date_from && query.date_to) {
        where.changed_at = { [Op.between]: [query.date_from, query.date_to] };
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
        limit: 500,
    });
}

module.exports = { getLogs };

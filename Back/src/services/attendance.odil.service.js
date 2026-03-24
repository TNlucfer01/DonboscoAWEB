// src/services/attendance.odil.service.js
// YC OD/IL management: create, update, cancel, list

const dayjs = require('dayjs');
const { AttendanceRecord, Student } = require('../models/index');
const AppError = require('../utils/AppError');
const { blockPastDate } = require('../utils/dateHelpers');

// ── Create OD/IL Entry ────────────────────────────────────────
async function createODIL({ student_id, slot_id, date, status, od_reason, semester_id }, submitted_by) {
    if (!['OD', 'INFORMED_LEAVE'].includes(status)) {
        throw new AppError('VALIDATION_ERROR', 'Status must be OD or INFORMED_LEAVE', 400);
    }

    blockPastDate(date, 'Cannot create OD/IL for past dates');

    const [record, created] = await AttendanceRecord.findOrCreate({
        where: { student_id, date, slot_id, semester_id },
        defaults: {
            student_id, date, slot_id, semester_id,
            status, od_reason,
            submitted_by,
            submitted_at: new Date(),
            is_locked: true,
        },
    });

    if (!created) {
        if (record.is_locked) throw new AppError('ALREADY_LOCKED', 'This slot is already locked', 409);
        await record.update({ status, od_reason, is_locked: true, submitted_by });
    }

    return record;
}

// ── Update OD/IL Entry ────────────────────────────────────────
async function updateODIL(id, { status, od_reason }) {
    const record = await AttendanceRecord.findByPk(id);
    if (!record || !record.is_locked) throw new AppError('NOT_FOUND', 'OD/IL record not found', 404);

    if (dayjs(record.date).isBefore(dayjs(), 'day')) {
        throw new AppError('PAST_DATE', 'Cannot edit OD/IL for past dates', 400);
    }

    await record.update({ status, od_reason });
    return record;
}

// ── Cancel OD/IL Entry ────────────────────────────────────────
async function cancelODIL(id) {
    const record = await AttendanceRecord.findByPk(id);
    if (!record || !record.is_locked) throw new AppError('NOT_FOUND', 'OD/IL record not found', 404);
    await record.update({ is_locked: false, status: 'ABSENT', od_reason: null });
    return { message: 'OD/IL cancelled — row is now editable for staff' };
}

// ── List OD/IL Entries ────────────────────────────────────────
async function listODIL({ year }, currentUser) {
    const studentWhere = {};
    if (currentUser.role === 'YEAR_COORDINATOR') studentWhere.current_year = currentUser.managedYear;
    else if (year) studentWhere.current_year = Number(year);

    return AttendanceRecord.findAll({
        where: { is_locked: true, status: ['OD', 'INFORMED_LEAVE'] },
        include: [{ model: Student, as: 'student', where: studentWhere }],
        order: [['date', 'DESC']],
    });
}

module.exports = { createODIL, updateODIL, cancelODIL, listODIL };

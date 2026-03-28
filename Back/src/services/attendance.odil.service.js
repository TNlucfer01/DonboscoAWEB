// src/services/attendance.odil.service.js
// YC OD/IL management: load all students for a date, bulk create, update, cancel, list

const dayjs = require('dayjs');
const { AttendanceRecord, Student } = require('../models/index');
const AppError = require('../utils/AppError');
const { blockPastDate } = require('../utils/dateHelpers');

// ── Fetch all students for a given date (with their OD/IL state) ──────────────
async function fetchStudentsForDate({ date, managedYear }) {
    // Only allow future dates
    const today = dayjs().startOf('day');
    const targetDay = dayjs(date).startOf('day');
    if (targetDay.isBefore(today)) {
        throw new AppError('PAST_DATE', 'Cannot load OD/IL for past dates', 400);
    }

    // 1. All students in the year
    const students = await Student.findAll({
        where: { current_year: managedYear },
        order: [['roll_number', 'ASC']],
    });

    // 2. Existing locked OD/IL records for that date
    const locked = await AttendanceRecord.findAll({
        where: {
            date,
            is_locked: true,
            status: ['OD', 'INFORMED_LEAVE'],
        },
        include: [{
            model: Student,
            as: 'student',
            where: { current_year: managedYear },
            attributes: ['student_id'],
        }],
    });

    // Build a map: student_id -> { slot_id -> status, od_reason }
    const lockedMap = {};
    locked.forEach(r => {
        if (!lockedMap[r.student_id]) {
            lockedMap[r.student_id] = { periods: {}, od_reason: r.od_reason };
        }
        lockedMap[r.student_id].periods[r.slot_id] = r.status;
        if (r.od_reason) lockedMap[r.student_id].od_reason = r.od_reason; // take any non-null reason
    });

    // Was this date already submitted?
    const alreadySubmitted = locked.length > 0;

    return {
        date,
        alreadySubmitted,
        students: students.map(s => {
            const stuData = lockedMap[s.student_id];
            return {
                student_id: s.student_id,
                name: s.name,
                roll_number: s.roll_number,
                periods: {
                    1: stuData?.periods[1] || null,
                    2: stuData?.periods[2] || null,
                    3: stuData?.periods[3] || null,
                    4: stuData?.periods[4] || null,
                    5: stuData?.periods[5] || null,
                },
                od_reason: stuData?.od_reason || null,
            };
        }),
    };
}

// ── Bulk Create OD/IL Entries ─────────────────────────────────────────────────
async function bulkCreateODIL({ entries, semester_id }, submitted_by) {
    if (!entries || entries.length === 0) return { saved: 0 };

    const date = entries[0].date;
    blockPastDate(date, 'Cannot create OD/IL for past dates');

    let saved = 0;
    for (const e of entries) {
        if (!['OD', 'INFORMED_LEAVE'].includes(e.status)) continue;
        if (!e.slot_id || e.slot_id < 1 || e.slot_id > 5) continue;

        const [record, created] = await AttendanceRecord.findOrCreate({
            where: { student_id: e.student_id, date: e.date, slot_id: e.slot_id, semester_id },
            defaults: {
                student_id: e.student_id,
                date: e.date,
                slot_id: e.slot_id,
                semester_id,
                status: e.status,
                od_reason: e.od_reason || null,
                submitted_by,
                submitted_at: new Date(),
                is_locked: true,
            },
        });

        if (!created && !record.is_locked) {
            await record.update({
                status: e.status,
                od_reason: e.od_reason || null,
                is_locked: true,
                submitted_by,
            });
        }
        saved++;
    }

    return { saved };
}

// ── Create Single OD/IL Entry ─────────────────────────────────────────────────
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

// ── Update OD/IL Entry ────────────────────────────────────────────────────────
async function updateODIL(id, { status, od_reason }) {
    const record = await AttendanceRecord.findByPk(id);
    if (!record || !record.is_locked) throw new AppError('NOT_FOUND', 'OD/IL record not found', 404);

    if (dayjs(record.date).isBefore(dayjs(), 'day')) {
        throw new AppError('PAST_DATE', 'Cannot edit OD/IL for past dates', 400);
    }

    await record.update({ status, od_reason });
    return record;
}

// ── Cancel OD/IL Entry ────────────────────────────────────────────────────────
async function cancelODIL(id) {
    const record = await AttendanceRecord.findByPk(id);
    if (!record || !record.is_locked) throw new AppError('NOT_FOUND', 'OD/IL record not found', 404);
    await record.update({ is_locked: false, status: 'ABSENT', od_reason: null });
    return { message: 'OD/IL cancelled — row is now editable for staff' };
}

// ── List OD/IL Entries ────────────────────────────────────────────────────────
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

module.exports = { fetchStudentsForDate, bulkCreateODIL, createODIL, updateODIL, cancelODIL, listODIL };

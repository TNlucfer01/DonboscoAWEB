// src/services/attendance.service.js
const dayjs = require('dayjs');
const {
    AttendanceRecord, AttendanceAuditLog,
    Student, TimetableSlot, CollegeCalendar, Semester, Subject, Batch,
    sequelize,
} = require('../models/index');
const AppError = require('../utils/AppError');
const smsService = require('./sms.service');

// ── Fetch Students for Attendance ─────────────────────────────
async function fetchStudents({ year, batch_id, slot_id, date }) {
    // 1. Holiday check
    const holiday = await CollegeCalendar.findOne({ where: { date, day_type: 'HOLIDAY' } });
    if (holiday) throw new AppError('HOLIDAY', `Attendance blocked: ${holiday.holiday_name || 'Holiday'}`, 422);

    // 2. 20-min window check
    const slot = await TimetableSlot.findByPk(slot_id);
    if (!slot) throw new AppError('NOT_FOUND', 'Slot not found', 404);

    const slotStart = dayjs(`${date} ${slot.start_time}`);
    const diff = dayjs().diff(slotStart, 'minute');
    if (diff > 20) throw new AppError('WINDOW_EXPIRED', 'The 20-minute submission window has closed.', 422);
    if (diff < 0) throw new AppError('WINDOW_NOT_OPEN', 'This period has not started yet.', 422);

    // 3. Fetch students in the batch
    const students = await Student.findAll({
        where: { current_year: year, batch_id },
        attributes: ['student_id', 'name', 'roll_number', 'parent_phone'],
        order: [['roll_number', 'ASC']],
    });

    // 4. Check for existing locked (OD/IL) rows for this slot + date
    const existingRecords = await AttendanceRecord.findAll({
        where: { date, slot_id, student_id: students.map(s => s.student_id) },
        attributes: ['student_id', 'status', 'is_locked', 'od_reason'],
    });
    const lockMap = {};
    existingRecords.forEach(r => { lockMap[r.student_id] = r; });

    return students.map(s => ({
        student_id: s.student_id,
        name: s.name,
        roll_number: s.roll_number,
        is_locked: !!lockMap[s.student_id]?.is_locked,
        status: lockMap[s.student_id]?.status || null,
        od_reason: lockMap[s.student_id]?.od_reason || null,
        remaining_minutes: 20 - diff,
    }));
}

// ── Submit Attendance ─────────────────────────────────────────
async function submit({ records, slot_id, date, subject_id, submitted_by }) {
    // Re-check window before committing
    const slot = await TimetableSlot.findByPk(slot_id);
    const diff = dayjs().diff(dayjs(`${date} ${slot.start_time}`), 'minute');
    if (diff > 20) throw new AppError('WINDOW_EXPIRED', 'The 20-minute submission window has closed.', 422);

    // Get active semester
    const semester = await Semester.findOne({ where: { is_active: true } });
    if (!semester) throw new AppError('NO_ACTIVE_SEMESTER', 'No active semester found', 422);

    const now = new Date();
    const toInsert = [];

    for (const r of records) {
        const existing = await AttendanceRecord.findOne({
            where: { student_id: r.student_id, date, slot_id, semester_id: semester.semester_id }
        });
        if (existing?.is_locked) continue; // skip locked OD/IL rows

        toInsert.push({
            student_id: r.student_id,
            semester_id: semester.semester_id,
            subject_id: subject_id || null,
            date,
            slot_id,
            status: r.status,
            submitted_by,
            submitted_at: now,
            is_locked: false,
        });
    }

    if (toInsert.length === 0) return { message: 'No new records to submit' };

    await AttendanceRecord.bulkCreate(toInsert, {
        updateOnDuplicate: ['status', 'submitted_by', 'submitted_at'],
    });

    // Fire SMS for absent students (non-blocking)
    const absents = toInsert.filter(r => r.status === 'ABSENT');
    for (const r of absents) {
        const student = await Student.findByPk(r.student_id, { attributes: ['name', 'parent_phone'] });
        if (student) {
            smsService.sendAbsentSMS(student, date, slot_id, semester.semester_id).catch(console.error);
        }
    }

    return { submitted: toInsert.length, absents: absents.length };
}

// ── View Attendance ───────────────────────────────────────────
async function view({ year, date_from, date_to, semester_id }, currentUser) {
    const where = {};
    if (semester_id) where.semester_id = semester_id;
    if (date_from && date_to) where.date = { $between: [date_from, date_to] };

    // Scope by year via student join
    const studentWhere = {};
    if (currentUser.role === 'YEAR_COORDINATOR') studentWhere.current_year = currentUser.managedYear;
    else if (year) studentWhere.current_year = Number(year);

    return AttendanceRecord.findAll({
        where,
        include: [
            { model: Student, as: 'student', where: studentWhere, attributes: ['student_id', 'name', 'roll_number'] },
            { model: TimetableSlot, as: 'slot', attributes: ['slot_number', 'start_time'] },
            { model: Subject, as: 'subject', attributes: ['subject_name'] },
        ],
        order: [['date', 'DESC'], [{ model: TimetableSlot, as: 'slot' }, 'slot_number', 'ASC']],
        limit: 2000,
    });
}

// ── Principal: Correct Attendance ─────────────────────────────
async function correct({ record_id, new_status, od_reason }, changed_by) {
    const record = await AttendanceRecord.findByPk(record_id);
    if (!record) throw new AppError('NOT_FOUND', 'Record not found', 404);

    const old_status = record.status;
    await record.update({ status: new_status, od_reason: od_reason || null });

    // Insert audit log
    await AttendanceAuditLog.create({
        record_id,
        changed_by,
        old_status,
        new_status,
        changed_at: new Date(),
    });

    return { message: 'Attendance corrected', old_status, new_status };
}

// ── YC: OD / IL Entry ─────────────────────────────────────────
async function createODIL({ student_id, slot_id, date, status, od_reason, semester_id }, submitted_by) {
    if (!['OD', 'INFORMED_LEAVE'].includes(status)) {
        throw new AppError('VALIDATION_ERROR', 'Status must be OD or INFORMED_LEAVE', 400);
    }

    const [record, created] = await AttendanceRecord.findOrCreate({
        where: { student_id, date, slot_id, semester_id },
        defaults: { student_id, date, slot_id, semester_id, status, od_reason, submitted_by, submitted_at: new Date(), is_locked: true },
    });

    if (!created) {
        if (record.is_locked) throw new AppError('ALREADY_LOCKED', 'This slot is already locked', 409);
        await record.update({ status, od_reason, is_locked: true, submitted_by });
    }

    return record;
}

async function updateODIL(id, { status, od_reason }) {
    const record = await AttendanceRecord.findByPk(id);
    if (!record || !record.is_locked) throw new AppError('NOT_FOUND', 'OD/IL record not found', 404);
    if (!dayjs(record.date).isAfter(dayjs(), 'day')) {
        throw new AppError('PAST_DATE', 'Cannot edit OD/IL for past dates', 400);
    }
    await record.update({ status, od_reason });
    return record;
}

async function cancelODIL(id) {
    const record = await AttendanceRecord.findByPk(id);
    if (!record || !record.is_locked) throw new AppError('NOT_FOUND', 'OD/IL record not found', 404);
    await record.update({ is_locked: false, status: 'ABSENT', od_reason: null });
    return { message: 'OD/IL cancelled — row is now editable for staff' };
}

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

module.exports = { fetchStudents, submit, view, correct, createODIL, updateODIL, cancelODIL, listODIL };

// src/services/attendance.staff.service.js
// Staff attendance: fetch students, submit, correction fetch, correction submit

const { Op } = require('sequelize');
const {
    AttendanceAuditLog, AttendanceRecord, Student, TimetableSlot, Subject, User, TheoryBatch, LabBatch, sequelize,
} = require('../models/index');
const AppError = require('../utils/AppError');
const smsService = require('./sms.service');
const { checkHoliday, blockFutureDate, requireToday } = require('../utils/dateHelpers');
const { resolveODReason, getActiveSemester, formatStudentAttendance } = require('../utils/attendanceHelpers');

// ── Fetch Students for Attendance Taking ──────────────────────
async function fetchStudents({ year, batch_id, batch_type, slot_id, date }) {
    await checkHoliday(date);
    blockFutureDate(date, 'Cannot access future dates for attendance');

    const batchKey = batch_type === 'THEORY' ? 'theory_batch_id' : 'lab_batch_id';

    const students = await Student.findAll({
        where: { current_year: year, [batchKey]: batch_id },
        attributes: ['student_id', 'name', 'roll_number', 'current_year'],
        order: [['roll_number', 'ASC']],
    });

    if (students.length === 0) return { students: [], remaining_minutes: 0 };

    // Check for existing locked (OD/IL) rows
    const existingRecords = await AttendanceRecord.findAll({
        where: { date, slot_id, student_id: students.map(s => s.student_id) },
        attributes: ['student_id', 'status', 'is_locked', 'od_reason'],
    });

    const lockMap = {};
    existingRecords.forEach(r => { lockMap[r.student_id] = r; });

    const studentData = students.map(s => {
        const existing = lockMap[s.student_id];
        const status = existing?.status || 'PRESENT';
        const od_reason = resolveODReason(status, existing?.od_reason || null);

        return {
            student_id: s.student_id,
            rollno: s.roll_number,
            name: s.name,
            year: s.current_year,
            is_locked: !!existing?.is_locked,
            status,
            od_reason,
        };
    });

    return { students: studentData, remaining_minutes: 20 };
}

// ── Submit Staff Attendance ───────────────────────────────────
async function submit({ records, slot_id, date, subject_id, submitted_by }) {
    requireToday(date);

    /* ── TIMER ENFORCEMENT (COMMENTED OUT FOR DEVELOPMENT) ──
    const slot = await TimetableSlot.findByPk(slot_id);
    if (!slot) throw new AppError('NOT_FOUND', 'Timetable slot not found', 404);
    
    // Parse slot start time assuming format 'HH:mm:ss'
    const [hours, minutes] = slot.start_time.split(':').map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(hours, minutes, 0, 0);
    
    const diffMins = (new Date() - slotStart) / (1000 * 60);
    // Allows submission from 10 mins before slot starts up to 20 mins after it starts
    if (diffMins < -10 || diffMins > 20) {
        throw new AppError('TIMEOUT', 'Attendance submission window (20 mins from slot start) has expired or not yet open', 403);
    }
    ────────────────────────────────────────────────────────── */

    const semester = await getActiveSemester();
    const now = new Date();
    const studentIds = records.map(r => r.student_id);

    // ── Batch-fetch ALL existing records in one query (fixes N+1) ──
    const existingRecords = await AttendanceRecord.findAll({
        where: { student_id: studentIds, date, slot_id, semester_id: semester.semester_id },
        attributes: ['student_id', 'is_locked'],
    });
    const lockedSet = new Set(
        existingRecords.filter(e => e.is_locked).map(e => e.student_id)
    );

    const toInsert = records
        .filter(r => !lockedSet.has(r.student_id))
        .map(r => ({
            student_id: r.student_id,
            semester_id: semester.semester_id,
            subject_id: subject_id || null,
            date, slot_id,
            status: r.status,
            od_reason: resolveODReason(r.status, r.od_reason),
            submitted_by,
            submitted_at: now,
            is_locked: true,
        }));

    if (toInsert.length === 0) return { message: 'No new records to submit' };

    await AttendanceRecord.bulkCreate(toInsert, {
        updateOnDuplicate: ['status', 'od_reason', 'submitted_by', 'submitted_at', 'is_locked'],
    });

    // ── Batch-fetch absent students for SMS in one query (fixes N+1) ──
    const absentIds = toInsert.filter(r => r.status === 'ABSENT').map(r => r.student_id);
    if (absentIds.length > 0) {
        const absentStudents = await Student.findAll({
            where: { student_id: absentIds },
            attributes: ['student_id', 'name', 'parent_phone'],
        });
        for (const student of absentStudents) {
            smsService.sendAbsentSMS(student, date, slot_id, semester.semester_id).catch(console.error);
        }
    }

    return _fetchUpdatedStudents(studentIds, date, slot_id);
}

// ── Fetch Students for Staff Correction ───────────────────────
async function fetchStaffCorrectionStudents({ year, batch_id, batch_type, slot_id, subject_id, date }) {
    blockFutureDate(date, 'Cannot access future dates for attendance');

    const batchKey = batch_type === 'THEORY' ? 'theory_batch_id' : 'lab_batch_id';

    const records = await AttendanceRecord.findAll({
        where: { date, slot_id, is_locked: false },
        include: [
            { model: Student, as: 'student', attributes: ['student_id', 'name', 'roll_number', 'current_year'], where: { current_year: year, [batchKey]: batch_id } },
            { model: TimetableSlot, as: 'slot', attributes: ['slot_number'] },
            { model: Subject, as: 'subject', attributes: ['subject_name', 'subject_code'], where: subject_id ? { subject_id } : undefined },
            { model: User, as: 'submitter', attributes: ['name'] },
        ],
        attributes: ['record_id', 'student_id', 'status', 'od_reason', 'slot_id', 'subject_id', 'submitted_by', 'is_locked'],
        raw: true, nest: true,
    });

    const formattedRecords = records.map(r => ({
        record_id: r.record_id,
        student_id: r.student_id,
        studentname: r.student?.name,
        rollno: r.student?.roll_number,
        status: r.status || 'PRESENT',
        od_reason: r.od_reason || 'None',
        is_locked: !!r.is_locked,
    }));

    const firstRecord = records[0] || {};

    // Fetch batch name
    let batchName = 'N/A';
    if (batch_type === 'THEORY') {
        const b = await TheoryBatch.findByPk(batch_id);
        if (b) batchName = b.name;
    } else {
        const b = await LabBatch.findByPk(batch_id);
        if (b) batchName = b.name;
    }

    return {
        year,
        subject: firstRecord.subject?.subject_name || 'N/A',
        subject_name: firstRecord.subject?.subject_name || 'N/A',
        subject_code: firstRecord.subject?.subject_code || 'N/A',
        submittername: firstRecord.submitter?.name || 'N/A',
        submitter_name: firstRecord.submitter?.name || 'N/A',
        "batch name": batchName,
        student: formattedRecords,
        records: formattedRecords,
        slot_number: firstRecord.slot?.slot_number || 'N/A',
    };
}

// ── Submit Staff Attendance Correction ────────────────────────
async function correctStaffSubmit({ records, slot_id, date, subject_id, submitted_by }) {
    blockFutureDate(date, 'Cannot correct attendance for future dates');

    // ── 7-DAY CORRECTION HORIZON LIMIT ──
    const recordDate = new Date(date);
    const now = new Date();
    // Calculate difference in days (ignoring time of day)
    const normalizedRecordDate = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());
    const normalizedNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((normalizedNow - normalizedRecordDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 7) {
        throw new AppError('VALIDATION_ERROR', 'Cannot correct attendance records older than 7 days', 400);
    }

    /* ── TIMER ENFORCEMENT (COMMENTED OUT FOR DEVELOPMENT) ──
    const slot = await TimetableSlot.findByPk(slot_id);
    if (slot) {
        const [hours, minutes] = slot.start_time.split(':').map(Number);
        const slotStart = new Date(date);
        slotStart.setHours(hours, minutes, 0, 0);
        
        const diffMins = (new Date() - slotStart) / (1000 * 60);
        if (diffMins < -10 || diffMins > 20) {
            throw new AppError('TIMEOUT', 'Correction submission window has expired', 403);
        }
    }
    ────────────────────────────────────────────────────────── */

    const semester = await getActiveSemester();
    const toInsert = [];

    for (const r of records) {
        await sequelize.transaction(async (t) => {
            const existing = await AttendanceRecord.findOne({
                where: { student_id: r.student_id, date, slot_id, semester_id: semester.semester_id },
                transaction: t,
            });
            if (existing?.is_locked && existing.status === 'OD') return;

            if (existing && existing.status !== r.status) {
                await AttendanceAuditLog.create({
                    record_id: existing.record_id,
                    changed_by: submitted_by,
                    old_status: existing.status, new_status: r.status,
                    changed_at: new Date(),
                }, { transaction: t });
            }

            toInsert.push({
                student_id: r.student_id,
                semester_id: semester.semester_id,
                subject_id: subject_id || null,
                date, slot_id,
                status: r.status,
                od_reason: resolveODReason(r.status, r.od_reason),
                submitted_by,
                submitted_at: now,
                is_locked: 1,
            });
        });
    }

    if (toInsert.length === 0) return { message: 'No new records to submit' };

    await AttendanceRecord.bulkCreate(toInsert, {
        updateOnDuplicate: ['status', 'od_reason', 'submitted_by', 'submitted_at', 'is_locked'],
    });

    for (const r of toInsert.filter(r => r.status === 'ABSENT')) {
        const student = await Student.findByPk(r.student_id, { attributes: ['student_id', 'name', 'roll_number', 'parent_phone'] });
        if (student) smsService.sendAbsentSMS(student, date, slot_id, semester.semester_id).catch(console.error);
    }

    return _fetchUpdatedStudents(records.map(r => r.student_id), date, slot_id);
}

// ── Shared: re-fetch updated student state after submit/correct ──
async function _fetchUpdatedStudents(studentIds, date, slot_id) {
    const [students, attendance] = await Promise.all([
        Student.findAll({
            where: { student_id: studentIds },
            attributes: ['student_id', 'name', 'roll_number', 'current_year'],
            order: [['roll_number', 'ASC']],
        }),
        AttendanceRecord.findAll({
            where: { date, slot_id, student_id: studentIds },
            attributes: ['student_id', 'status', 'is_locked', 'od_reason'],
        }),
    ]);

    const map = {};
    attendance.forEach(ar => { map[ar.student_id] = ar; });

    return {
        student: students.map(s => formatStudentAttendance(s, map[s.student_id])),
    };
}

module.exports = { fetchStudents, submit, fetchStaffCorrectionStudents, correctStaffSubmit };

// src/services/attendance.principal.service.js
// Principal attendance: fetch, save, correct single, correct bulk

const {
    AttendanceRecord, AttendanceAuditLog, Student, TimetableSlot, Subject, User,
} = require('../models/index');
const AppError = require('../utils/AppError');
const { getActiveSemester } = require('../utils/attendanceHelpers');

// ── Fetch Students for Principal View (single period) ─────────
async function fetchStudentsPrincipal({ year, date, period }) {
    if (!year || !date) throw new AppError('VALIDATION_ERROR', 'year and date are required', 400);

    const records = await AttendanceRecord.findAll({
        where: { date },
        include: [
            { model: Student, as: 'student', attributes: ['student_id', 'name', 'roll_number', 'current_year'], where: { current_year: year } },
            { model: TimetableSlot, as: 'slot', attributes: ['slot_number'], where: { slot_number: period } },
            { model: Subject, as: 'subject', attributes: ['subject_name', 'subject_code'] },
            { model: User, as: 'submitter', attributes: ['name'] },
        ],
        attributes: ['record_id', 'student_id', 'status', 'od_reason', 'slot_id', 'subject_id', 'submitted_by', 'is_locked'],
        raw: true, nest: true,
    });

    const formattedRecords = records.map(r => ({
        record_id: r.record_id,
        student_id: r.student_id,
        student_name: r.student.name,
        roll_number: r.student.roll_number,
        status: r.status,
        od_reason: r.od_reason,
        is_locked: r.is_locked,
    }));

    const first = records[0] || {};
    return {
        slot_number: first.slot?.slot_number || period,
        subject_name: first.subject?.subject_name || 'N/A',
        subject_code: first.subject?.subject_code || 'N/A',
        submitter_name: first.submitter?.name || 'N/A',
        current_year: first.student?.current_year || 'N/A',
        records: formattedRecords,
    };
}

// ── Save/Update Records (Principal) ──────────────────────────
async function saveStudentPri(records, changed_by) {
    const results = [];
    for (const r of records) {
        const { record_id, status, is_locked, remarks, od_reason } = r;
        const finalRemarks = remarks !== undefined ? remarks : (od_reason || null);
        const finalLocked = is_locked ? true : false;

        if (!record_id) continue;

        const existing = await AttendanceRecord.findByPk(record_id);
        if (!existing) continue;

        const old_status = existing.status;
        await existing.update({ status, od_reason: finalRemarks, is_locked: finalLocked });

        if (old_status !== status) {
            await AttendanceAuditLog.create({
                record_id,
                changed_by: changed_by || existing.submitted_by,
                old_status, new_status: status,
                changed_at: new Date(),
            });
        }
        results.push({ record_id, action: 'updated' });
    }
    return { saved: results.length, results };
}

// ── Single Record Correction (Principal) ─────────────────────
async function correct({ record_id, new_status, od_reason }, changed_by) {
    const record = await AttendanceRecord.findByPk(record_id);
    if (!record) throw new AppError('NOT_FOUND', 'Record not found', 404);

    const old_status = record.status;
    await record.update({ status: new_status, od_reason: od_reason || null });

    await AttendanceAuditLog.create({
        record_id, changed_by,
        old_status, new_status,
        changed_at: new Date(),
    });

    return { message: 'Attendance corrected', old_status, new_status };
}

// ── Bulk Upsert (Principal — all 5 slots) ────────────────────
async function correctBulk(records, changed_by) {
    const semester = await getActiveSemester();
    const results = [];

    for (const r of records) {
        const { record_id, student_id, slot_id, date, new_status, od_reason } = r;

        if (record_id) {
            const existing = await AttendanceRecord.findByPk(record_id);
            if (!existing) continue;

            const old_status = existing.status;
            if (old_status !== new_status || existing.od_reason !== (od_reason || null)) {
                await existing.update({ status: new_status, od_reason: od_reason || null });
                await AttendanceAuditLog.create({
                    record_id, changed_by, old_status, new_status,
                    changed_at: new Date(),
                });
            }
            results.push({ action: 'updated', record_id, student_id, slot_id });
        } else {
            const [newRecord, created] = await AttendanceRecord.findOrCreate({
                where: { student_id, slot_id, date, semester_id: semester.semester_id },
                defaults: {
                    student_id, slot_id, date,
                    semester_id: semester.semester_id,
                    status: new_status,
                    od_reason: od_reason || null,
                    submitted_by: changed_by,
                    submitted_at: new Date(),
                    is_locked: false,
                },
            });

            if (!created) {
                const old_status = newRecord.status;
                await newRecord.update({ status: new_status, od_reason: od_reason || null });
                await AttendanceAuditLog.create({
                    record_id: newRecord.record_id, changed_by,
                    old_status, new_status,
                    changed_at: new Date(),
                });
            }
            results.push({ action: created ? 'created' : 'upserted', student_id, slot_id });
        }
    }

    return { saved: results.length, results };
}

module.exports = { fetchStudentsPrincipal, saveStudentPri, correct, correctBulk };

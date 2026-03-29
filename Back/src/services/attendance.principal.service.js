// src/services/attendance.principal.service.js
// Principal attendance: fetch, save, correct single, correct bulk

const {
    AttendanceRecord, AttendanceAuditLog, Student, TimetableSlot, Subject, User, TheoryBatch, LabBatch, sequelize, Semester
} = require('../models/index');
const { Sequelize } = require('sequelize');
const AppError = require('../utils/AppError');
const { getActiveSemester } = require('../utils/attendanceHelpers');

async function getBatch(year, date, slotId) {
    if (!year || !date || !slotId) throw new AppError('VALIDATION_ERROR', 'year, date, and slot_id are required', 400);

    const record = await AttendanceRecord.findOne({
        where: { 
            date: date,
            slot_id: slotId 
        },
        include: [{
            model: Student,
            as: 'student',
            where: { current_year: year },
            attributes: [] // We only need the join to filter by year
        }],
        attributes: ['class_type']
    });

    if (!record) return []; // Return empty if no record exists for this slot

    // 2. Based on the detected type, fetch ALL batches for that year
    if (record.class_type === 'THEORY') {
        return await TheoryBatch.findAll({
            where: { year: year },
            attributes: ['name', ['theory_batch_id', 'id'], [Sequelize.literal("'THEORY'"), 'type']]
        });
    } else if (record.class_type === 'LAB') {
        return await LabBatch.findAll({
            where: { year: year },
            attributes: ['name', ['lab_batch_id', 'id'], [Sequelize.literal("'LAB'"), 'type']]
        });
    }
    return [];
}



// ── Fetch Students for Principal View (single period) ─────────
async function fetchStudentsPrincipal({ year, date, period, batch_id, batch_type }) {
    if (!year || !date) throw new AppError('VALIDATION_ERROR', 'year and date are required', 400);

    const studentWhere = { current_year: year };
    if (batch_type === 'THEORY' && batch_id) studentWhere.theory_batch_id = batch_id;
    if (batch_type === 'LAB' && batch_id) studentWhere.lab_batch_id = batch_id;

    // 1. Fetch all students in the targeted batch
    const students = await Student.findAll({
        where: studentWhere,
        attributes: ['student_id', 'name', 'roll_number', 'current_year'],
        order: [['roll_number', 'ASC']],
    });

    if (students.length === 0) {
        return {
            slot_number: period,
            subject_name: 'N/A',
            subject_code: 'N/A',
            subject_id: null,
            submitted_by: null,
            submitter_name: 'N/A',
            current_year: year,
            records: [],
            slot_id: null
        };
    }

    // 2. Fetch existing records for those students on that date and period
    const records = await AttendanceRecord.findAll({
        where: { date, student_id: students.map(s => s.student_id) },
        include: [
            { model: TimetableSlot, as: 'slot', attributes: ['slot_number', 'slot_id'], where: { slot_number: period } },
            { model: Subject, as: 'subject', attributes: ['subject_name', 'subject_code'] },
            { model: User, as: 'submitter', attributes: ['name'] },
        ],
        attributes: ['record_id', 'student_id', 'status', 'od_reason', 'slot_id', 'subject_id', 'submitted_by', 'is_locked'],
        raw: true, nest: true,
    });

    const recordMap = {};
    records.forEach(r => { recordMap[r.student_id] = r; });

    const formattedRecords = students.map(s => {
        const r = recordMap[s.student_id];
        return {
            record_id: r ? r.record_id : null,
            student_id: s.student_id,
            student_name: s.name,
            roll_number: s.roll_number,
            status: r ? r.status : 'ABSENT', // Default missing to ABSENT
            od_reason: r ? (r.od_reason || '') : '',
            is_locked: r ? r.is_locked : 0,
            remarks: ''
        };
    });

    const first = records[0] || {};
    return {
        slot_number: first.slot?.slot_number || period,
        subject_name: first.subject?.subject_name || 'N/A',
        subject_code: first.subject?.subject_code || 'N/A',
        subject_id: first.subject_id || null,
        submitted_by: first.submitted_by || null,
        submitter_name: first.submitter?.name || 'N/A',
        current_year: year,
        records: formattedRecords,
        slot_id: first.slot?.slot_id || first.slot_id || null
    };
}

// ── Save/Update Records (Principal) ──────────────────────────
async function saveStudentPri({ records, date, slot_id, subject_id }, changed_by) {
    if (!slot_id || !subject_id || !date) {
        throw new AppError('VALIDATION_ERROR', 'Missing context (date/slot/subject) for creating records. Ensure the class has been initialized by staff first.', 400);
    }
    
    // I02: Look up the semester that covers the correction date, not just the active one
    // This prevents past-semester corrections being saved with the current semester's FK
    const { Op } = require('sequelize');
    const semester = await Semester.findOne({
        where: {
            start_date: { [Op.lte]: date },
            end_date: { [Op.gte]: date }
        }
    }) || await getActiveSemester(); // Fallback to active if date not in any semester range
    const results = [];
    const logs = [];
    const upserts = [];

    // Pre-fetch existing records to detect changes for audit
    const existingRecords = await AttendanceRecord.findAll({
        where: { record_id: records.map(r => r.record_id).filter(id => id) },
        attributes: ['record_id', 'status', 'submitted_by']
    });
    const existingMap = {};
    existingRecords.forEach(e => { existingMap[e.record_id] = e; });

    for (const r of records) {
        const { record_id, student_id, status, is_locked, remarks, od_reason } = r;
        const finalRemarks = remarks !== undefined && remarks !== '' ? remarks : (od_reason || null);
        const finalLocked = is_locked ? true : false;

        const recordToUpsert = {
            record_id: record_id || undefined, // undefined -> auto-increment insert
            student_id,
            slot_id,
            subject_id,
            semester_id: semester.semester_id,
            date,
            status,
            od_reason: finalRemarks,
            is_locked: finalLocked,
            submitted_by: changed_by,
            submitted_at: new Date()
        };
        upserts.push(recordToUpsert);

        // Audit logs for updates
        if (record_id && existingMap[record_id]) {
            const oldRecord = existingMap[record_id];
            if (oldRecord.status !== status) {
                logs.push({
                    record_id,
                    changed_by,
                    old_status: oldRecord.status,
                    new_status: status,
                    changed_at: new Date(),
                });
            }
            results.push({ record_id, action: 'updated' });
        } else {
            results.push({ student_id, action: 'created' }); // Will get real record_id on upsert
        }
    }

    // Execute everything in one fast transaction block
    await sequelize.transaction(async (t) => {
        const created = await AttendanceRecord.bulkCreate(upserts, {
            updateOnDuplicate: ['status', 'od_reason', 'is_locked', 'submitted_by', 'submitted_at'],
            transaction: t,
            returning: true // Gets IDs for newly inserted records
        });
        
        // Fix up logs for newly created records that didn't have record_id
        if (logs.length > 0) {
            await AttendanceAuditLog.bulkCreate(logs, { transaction: t });
        }
    });

    return { saved: records.length, results };
}

// ── Single Record Correction (Principal) ─────────────────────
async function correct({ record_id, new_status, od_reason }, changed_by) {
    return sequelize.transaction(async (t) => {
        const record = await AttendanceRecord.findByPk(record_id, { transaction: t });
        if (!record) throw new AppError('NOT_FOUND', 'Record not found', 404);

        const old_status = record.status;
        await record.update(
            { status: new_status, od_reason: od_reason || null },
            { transaction: t }
        );

        await AttendanceAuditLog.create({
            record_id, changed_by,
            old_status, new_status,
            changed_at: new Date(),
        }, { transaction: t });

        return { message: 'Attendance corrected', old_status, new_status };
    });
}

// ── Bulk Upsert (Principal — all 5 slots) ────────────────────
async function correctBulk(records, changed_by) {
    const semester = await getActiveSemester();
    const results = [];

    for (const r of records) {
        const { record_id, student_id, slot_id, date, new_status, od_reason } = r;

        await sequelize.transaction(async (t) => {
            if (record_id) {
                const existing = await AttendanceRecord.findByPk(record_id, { transaction: t });
                if (!existing) return;

                const old_status = existing.status;
                if (old_status !== new_status || existing.od_reason !== (od_reason || null)) {
                    await existing.update(
                        { status: new_status, od_reason: od_reason || null },
                        { transaction: t }
                    );
                    await AttendanceAuditLog.create({
                        record_id, changed_by, old_status, new_status,
                        changed_at: new Date(),
                    }, { transaction: t });
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
                    transaction: t,
                });

                if (!created) {
                    const old_status = newRecord.status;
                    await newRecord.update(
                        { status: new_status, od_reason: od_reason || null },
                        { transaction: t }
                    );
                    await AttendanceAuditLog.create({
                        record_id: newRecord.record_id, changed_by,
                        old_status, new_status,
                        changed_at: new Date(),
                    }, { transaction: t });
                }
                results.push({ action: created ? 'created' : 'upserted', student_id, slot_id });
            }
        });
    }

    return { saved: results.length, results };
}
module.exports = { fetchStudentsPrincipal, getBatch, saveStudentPri, correct, correctBulk };

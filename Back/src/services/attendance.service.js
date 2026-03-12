 // src/services/attendance.service.js
 const dayjs = require('dayjs');
 const { Op } = require('sequelize');
 const {
    AttendanceRecord, AttendanceAuditLog,
    Student, TimetableSlot, CollegeCalendar, Semester, Subject,User
 
 } = require('../models/index');
 
 const AppError = require('../utils/AppError');
 const smsService = require('./sms.service');

 // ── Fetch Students for Attendance ─────────────────────────────
 async function fetchStudents({ year, batch_id, batch_type, slot_id, date }) {
    // 1. Holiday check
    const holiday = await CollegeCalendar.findOne({ where: { date, day_type: 'HOLIDAY' } });
    if (holiday) throw new AppError('HOLIDAY', `Attendance blocked: ${holiday.holiday_name || 'Holiday'}`, 422);

    // 2. 20-min window check — fetch the slot's start_time, compute elapsed minutes
    //for now only 
    // const slot = await TimetableSlot.findByPk(slot_id);
    // if (!slot) throw new AppError('NOT_FOUND', 'Slot not found', 404);

    // const slotStart = dayjs(`${date} ${slot.start_time}`);
    // const diff = dayjs().diff(slotStart, 'minute');
    // if (diff > 20) throw new AppError('WINDOW_EXPIRED', 'The 20-minute submission window has closed.', 422);
    // if (diff < 0) throw new AppError('WINDOW_NOT_OPEN', 'This period has not started yet.', 422);
    // 3. Fetch students in the batch (theory or lab based on batch_type)

    const batchKey = batch_type === 'THEORY' ? 'theory_batch_id' : 'lab_batch_id';
    
    //studnet detials 
    const students = await Student.findAll({
        where: { current_year: year, [batchKey]: batch_id },
        attributes: ['student_id', 'name', 'roll_number', 'current_year'],
        order: [['roll_number', 'ASC']],
    });

    // 4. Check for existing locked (OD/IL) rows for this slot + date
    // This prevents staff from overwriting YC-approved OD/IL entries
   //this is needed to prevent staff from overwriting YC-approved OD/IL entries
    const existingRecords = await AttendanceRecord.findAll({
        where: { date, slot_id, student_id: students.map(s => s.student_id) },
        attributes: ['student_id', 'status', 'is_locked', 'od_reason'],
    });

    const lockMap = {};
    existingRecords.forEach(r => { lockMap[r.student_id] = r; });
    
    const studentData = students.map(s => ({
        student_id: s.student_id,
        rollno: s.roll_number,
        name: s.name,
        year: s.current_year,
        is_locked: !!lockMap[s.student_id]?.is_locked,
        status: lockMap[s.student_id]?.status || 'Present',
        od_reason: lockMap[s.student_id]?.od_reason || null,
    }));

    return {
        students: studentData,
        remaining_minutes: 20 // Frontend should start a countdown timer from this value
    };
 }



 // ── Submit Attendance ─────────────────────────────────────────
 // Yes, this handles multiple students at once — the `records` array contains
 // one entry per student with their status. Multiple staff can submit for
 // different batches/slots simultaneously without conflict.
 async function submit({ records, slot_id, date, subject_id, submitted_by }) {
    // Block past-date submissions — staff/YC should not submit for past dates
    if (dayjs(date).isBefore(dayjs(), 'day')) {
        throw new AppError('PAST_DATE', 'Cannot submit attendance for past dates', 400);
    }

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

    // bulkCreate with updateOnDuplicate upserts — if the unique index
    // (student_id, date, slot_id, semester_id) already exists, it updates
    // the status/submitted_by/submitted_at instead of inserting a duplicate
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

    // Fetch and return the updated state for all students in the request
    const studentIds = records.map(r => r.student_id);
    const [updatedStudents, updatedAttendance] = await Promise.all([
        Student.findAll({
            where: { student_id: studentIds },
            attributes: ['student_id', 'name', 'roll_number', 'current_year'],
            order: [['roll_number', 'ASC']]
        }),
        AttendanceRecord.findAll({
            where: { date, slot_id, student_id: studentIds },
            attributes: ['student_id', 'status', 'is_locked', 'od_reason']
        })
    ]);

    const attendanceMap = {};
    updatedAttendance.forEach(ar => { attendanceMap[ar.student_id] = ar; });

    return {
        student: updatedStudents.map(s => ({
            student_id: s.student_id,
            rollno: s.roll_number,
            name: s.name,
            year: s.current_year,
            status: attendanceMap[s.student_id]?.status || null,
            od_reason: attendanceMap[s.student_id]?.od_reason || null,
            is_locked: !!attendanceMap[s.student_id]?.is_locked
        }))
    };
 }

 // ── View Attendance ───────────────────────────────────────────
 async function view({ year, date_from, date_to, semester_id }, currentUser) {
    const where = {};
    if (semester_id) where.semester_id = semester_id;
    if (date_from && date_to) where.date = { [Op.between]: [date_from, date_to] };

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

 // ── Principal: Correct Attendance (single record) ─────────────
 // TODO: Support batch correction of multiple slots at once (currently corrects one record at a time)
 async function correct({ record_id, new_status, od_reason }, changed_by) {
    const record = await AttendanceRecord.findByPk(record_id);
    if (!record) throw new AppError('NOT_FOUND', 'Record not found', 404);

    const old_status = record.status;
    await record.update({ status: new_status, od_reason: od_reason || null });

    await AttendanceAuditLog.create({
        record_id,
        changed_by,
        old_status,
        new_status,
        changed_at: new Date(),
    });

    return { message: 'Attendance corrected', old_status, new_status };
 }

 // ── Principal: Bulk Upsert Attendance (all 5 slots for a student on a date) ──
 // For each record: if record_id provided → update; if null → create new record.
 // This allows principal to set attendance even for periods staff never submitted.
 async function correctBulk(records, changed_by) {
    const semester = await Semester.findOne({ where: { is_active: true } });
    if (!semester) throw new AppError('NO_ACTIVE_SEMESTER', 'No active semester found', 422);

    const results = [];

    for (const r of records) {
        const { record_id, student_id, slot_id, date, new_status, od_reason } = r;

        if (record_id) {
            // ── UPDATE existing record ────────────────────────────
            const existing = await AttendanceRecord.findByPk(record_id);
            if (!existing) continue;

            const old_status = existing.status;
            if (old_status !== new_status || existing.od_reason !== (od_reason || null)) {
                await existing.update({ status: new_status, od_reason: od_reason || null });
                await AttendanceAuditLog.create({
                    record_id,
                    changed_by,
                    old_status,
                    new_status,
                    changed_at: new Date(),
                });
            }
            results.push({ action: 'updated', record_id, student_id, slot_id });
        } else {
            // ── CREATE new record ─────────────────────────────────
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
                // Row already existed (race condition) — just update it
                const old_status = newRecord.status;
                await newRecord.update({ status: new_status, od_reason: od_reason || null });
                await AttendanceAuditLog.create({
                    record_id: newRecord.record_id,
                    changed_by,
                    old_status,
                    new_status,
                    changed_at: new Date(),
                });
            }
            results.push({ action: created ? 'created' : 'upserted', student_id, slot_id });
        }
    }

    return { saved: results.length, results };
 }

 // ── YC: OD / IL Entry ─────────────────────────────────────────
 // TODO: Support batch OD/IL entry for multiple slots at once
 async function createODIL({ student_id, slot_id, date, status, od_reason, semester_id }, submitted_by) {
    if (!['OD', 'INFORMED_LEAVE'].includes(status)) {
        throw new AppError('VALIDATION_ERROR', 'Status must be OD or INFORMED_LEAVE', 400);
    }

    // Block past-date OD/IL entries
    if (dayjs(date).isBefore(dayjs(), 'day')) {
        throw new AppError('PAST_DATE', 'Cannot create OD/IL for past dates', 400);
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

 // TODO: Support batch update of multiple slots at once
 async function updateODIL(id, { status, od_reason }) {
    const record = await AttendanceRecord.findByPk(id);
    if (!record || !record.is_locked) throw new AppError('NOT_FOUND', 'OD/IL record not found', 404);
    if (!dayjs(record.date).isAfter(dayjs(), 'day')) {
        throw new AppError('PAST_DATE', 'Cannot edit OD/IL for past dates', 400);
    }
    await record.update({ status, od_reason });
    return record;
 }

 // Cancel OD/IL — reserved for future use
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


 // ── Principal: Fetch Students with 5-slot pivot for a given year + date ───────
 // the frontendneeds the  following 1. subject name of that particlar hour and then also the staff name 
 //i get a array of things with the following keys sno,rollno,year,status, unloack ,remarks for that hour 
 async function fetchStudentsPrincipal({ year, date ,period}) {
    if (!year || !date) throw new AppError('VALIDATION_ERROR', 'year and date are required', 400);

    // 1. Get all timetable slots (slot_number 1–5) to build the slotMap
    // const allSlots = await TimetableSlot.findAll({ attributes: ['slot_id', 'slot_number'] });
    // const slotMap = {}; // { slotNumber: slot_id }
    // slotMap[period] = period;

    // // 2. Get all students in the year good
    // const students = await Student.findAll({
    //     where: { current_year: Number(year) },
    //     attributes: ['student_id', 'name', 'roll_number', 'current_year'],
    //     order: [['roll_number', 'ASC']],
    // });

    // if (students.length === 0) return { slotMap, students: [] };

    // const studentIds = students.map(s => s.student_id);

    // 3. Get all attendance records for those students on that date (all 5 slots) i want for only one slot 
 const records = await AttendanceRecord.findAll({
  where: {
    date: date, // e.g., '2026-03-11'
  },
  include: [
    {
      model: Student,
      as: 'student',
      attributes: ['student_id', 'name', 'roll_number', 'current_year'],
      where: { current_year: year } 
    },
    {
      model: TimetableSlot,
      as: 'slot',
      attributes: ['slot_number'],
      where: { slot_number: period } 
    },
    {
      model: Subject,
      as: 'subject',
      attributes: ['subject_name', 'subject_code']
    },
    {
      model: User,
      as: 'submitter',
      attributes: ['name']
    }
  ],
  attributes: [
    'record_id',
    'student_id',
    'status',
    'od_reason',
    'slot_id',
    'subject_id',
    'submitted_by',
    'is_locked'
  ]
  ,raw: true,
  nest: true 
 });
 // SELECT
//     ar.record_id,
//     ar.student_id,
//     s.name AS student_name,
//     s.roll_number,
//     s.current_year,
//     ar.status,
//     ar.od_reason,
//     ar.slot_id,
//     ar.subject_id,
//     ar.submitted_by,
//     ar.is_locked,
//     ts.slot_number,
//     sub.subject_name,
//     sub.subject_code,
//     u.name AS submitter_name
// FROM attendance_records AS ar

// INNER JOIN students AS s
//     ON ar.student_id = s.student_id

// INNER JOIN timetable_slots AS ts
//     ON ar.slot_id = ts.slot_id

// INNER JOIN subjects AS sub
//     ON ar.subject_id = sub.subject_id

// INNER JOIN users AS u
//     ON ar.submitted_by = u.user_id

// WHERE s.current_year = 2           -- specific year filter
//   AND ar.date = '2026-03-11'       -- specific date
//   AND ts.slot_number = 2; 



// convert this in ot a sequlize query 

    // 4. Build a lookup: { student_id: { slotNumber: recordData } }
    // const recordMap = {};
    // for (const r of records) {
    //     const slotNum = r.slot?.slot_number;
    //     if (!slotNum) continue;
    //     if (!recordMap[r.student_id]) recordMap[r.student_id] = {};
    //     recordMap[r.student_id][slotNum] = {
    //         record_id: r.record_id,
    //         slot_id: r.slot_id,           // needed to update the right record
    //         status: r.status,
    //         od_reason: r.od_reason || null,
    //         subject: r.subject?.subject_name || null,
    //     };
    // }

    // // 5. Pivot into one row per student — null for periods with no existing record
    // const pivoted = students.map(s => ({
    //     student_id: s.student_id,
    //     name: s.name,
    //     roll_number: s.roll_number,
    //     current_year: s.current_year,
    //     period1: recordMap[s.student_id]?.[1] || null,
    //     period2: recordMap[s.student_id]?.[2] || null,
    //     period3: recordMap[s.student_id]?.[3] || null,
    //     period4: recordMap[s.student_id]?.[4] || null,
    //     period5: recordMap[s.student_id]?.[5] || null,
    // }));

 const formattedRecords = records.map(r => ({
  record_id: r.record_id,
  student_id: r.student_id,
  student_name: r.student.name,
  roll_number: r.student.roll_number,
  status: r.status,
  od_reason: r.od_reason,
  is_locked: r.is_locked,
 
 }));

 // Check if records exist to avoid "cannot read property of undefined"
 const firstRecord = records[0] || {};

 return { 
    // 1. The Metadata (Header info)
    slot_number: firstRecord.slot?.slot_number || period,
    subject_name: firstRecord.subject?.subject_name || 'N/A',
    subject_code: firstRecord.subject?.subject_code || 'N/A',
    submitter_name: firstRecord.submitter?.name || 'N/A',
  current_year: firstRecord.student?.current_year || 'N/A',

    // 2. The Student List
    records: formattedRecords 
 };
 }
 module.exports = { fetchStudents, submit, view, correct, correctBulk, createODIL, updateODIL, cancelODIL, listODIL, fetchStudentsPrincipal };


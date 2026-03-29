// src/services/attendance.view.service.js
// Attendance viewing: view for YC/Principal

const { Op } = require('sequelize');
const { AttendanceRecord, Student, TimetableSlot, Subject } = require('../models/index');

// ── View Attendance Records ───────────────────────────────────
async function view({ year, date_from, date_to, semester_id }, currentUser) {
    const where = {};
    if (semester_id) where.semester_id = semester_id;
    if (date_from && date_to) where.date = { [Op.between]: [date_from, date_to] };

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
        limit: 10000,
    });
}

module.exports = { view };

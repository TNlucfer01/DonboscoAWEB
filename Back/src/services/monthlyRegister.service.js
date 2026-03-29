// src/services/monthlyRegister.service.js
// Monthly attendance register for staff — shows one row per student,
// one column per calendar day for the selected month + subject.

const { sequelize } = require('../models/index');
const { QueryTypes } = require('sequelize');

/**
 * Returns the list of distinct subjects that the given staff member
 * has submitted attendance for — used to populate the subject dropdown.
 */
async function getStaffSubjects(staffUserId) {
    return sequelize.query(`
        SELECT DISTINCT
            sub.subject_id,
            sub.subject_name,
            sub.subject_code,
            sub.subject_year
        FROM attendance_records ar
        JOIN subjects sub ON sub.subject_id = ar.subject_id
        WHERE ar.submitted_by = :staffUserId
          AND ar.subject_id IS NOT NULL
        ORDER BY sub.subject_year, sub.subject_name
    `, { replacements: { staffUserId }, type: QueryTypes.SELECT });
}

/**
 * GET /api/monthly-register?subject_id=&month=YYYY-MM
 *
 * Returns:
 * {
 *   subject: { subject_id, subject_name, subject_code },
 *   month: 'YYYY-MM',
 *   days: [1, 2, ..., 31],        // calendar days that have attendance data
 *   students: [
 *     {
 *       student_id, name, roll_number,
 *       days: { "1": "P", "3": "A", "5": "OD", ... },
 *       present, absent, total, percentage
 *     }
 *   ]
 * }
 */
async function getMonthlyRegister({ subject_id, month, staffUserId }) {
    if (!subject_id || !month) throw new Error('subject_id and month are required');

    // month is YYYY-MM; build range
    const dateFrom = `${month}-01`;
    // last day of month
    const [yr, mo] = month.split('-').map(Number);
    const lastDay = new Date(yr, mo, 0).getDate();
    const dateTo = `${month}-${String(lastDay).padStart(2, '0')}`;

    // 1. Fetch subject info
    const [subject] = await sequelize.query(`
        SELECT subject_id, subject_name, subject_code, subject_year
        FROM subjects WHERE subject_id = :subject_id
    `, { replacements: { subject_id }, type: QueryTypes.SELECT });

    if (!subject) throw new Error('Subject not found');

    // 2. Find which classes (years/batches) were taught for this subject/month
    const taughtBatches = await sequelize.query(`
        SELECT DISTINCT s.current_year, s.theory_batch_id, s.lab_batch_id
        FROM attendance_records ar
        JOIN students s ON s.student_id = ar.student_id
        WHERE ar.subject_id = :subject_id
          AND ar.submitted_by = :staffUserId
          AND ar.date BETWEEN :dateFrom AND :dateTo
    `, { replacements: { subject_id, staffUserId, dateFrom, dateTo }, type: QueryTypes.SELECT });

    if (taughtBatches.length === 0) return { subject, month, days: [], students: [] };

    // 3. Fetch ALL students belonging to these exact classes so zero-attendance students appear
    const { Student } = require('../models/index');
    const { Op } = require('sequelize');
    const orConditions = taughtBatches.map(b => {
        const cond = { current_year: b.current_year };
        // We link by whatever batch type the attendance was originally taken for
        if (b.theory_batch_id && b.lab_batch_id) {
             // In reality a class is usually either theory OR lab, but we include both if found
             cond[Op.or] = [{ theory_batch_id: b.theory_batch_id }, { lab_batch_id: b.lab_batch_id }];
        } else if (b.theory_batch_id) {
             cond.theory_batch_id = b.theory_batch_id;
        } else if (b.lab_batch_id) {
             cond.lab_batch_id = b.lab_batch_id;
        }
        return cond;
    });

    const allStudents = await Student.findAll({
        where: { [Op.or]: orConditions },
        attributes: ['student_id', 'name', 'roll_number'],
        order: [['roll_number', 'ASC']],
        raw: true
    });

    // 4. Fetch the attendance records across those dates
    const records = await sequelize.query(`
        SELECT
            ar.student_id,
            ar.date,
            ar.status,
            ar.od_reason
        FROM attendance_records ar
        WHERE ar.subject_id = :subject_id
          AND ar.submitted_by = :staffUserId
          AND ar.date BETWEEN :dateFrom AND :dateTo
    `, { replacements: { subject_id, staffUserId, dateFrom, dateTo }, type: QueryTypes.SELECT });

    // 5. Group by student, then by day. Pre-fill map with all students.
    const studentMap = {};
    allStudents.forEach(s => {
        studentMap[s.student_id] = {
            student_id: s.student_id,
            name: s.name,
            roll_number: s.roll_number,
            dayMap: {},
        };
    });

    records.forEach(r => {
        const sid = r.student_id;
        if (!studentMap[sid]) return; // Edge case: student deleted or transferred out entirely

        const day_num = new Date(r.date).getDate(); // Dialect agnostic day extraction
        const existing = studentMap[sid].dayMap[day_num];
        
        // Priority: ABSENT > OD/IL > PRESENT
        if (!existing) {
            studentMap[sid].dayMap[day_num] = r.status;
        } else if (r.status === 'ABSENT') {
            studentMap[sid].dayMap[day_num] = 'ABSENT';
        } else if (['OD', 'INFORMED_LEAVE'].includes(r.status) && existing === 'PRESENT') {
            studentMap[sid].dayMap[day_num] = r.status;
        }
    });

    // 4. Find all days that actually have data
    const daysSet = new Set();
    Object.values(studentMap).forEach(st =>
        Object.keys(st.dayMap).forEach(d => daysSet.add(Number(d)))
    );
    const days = Array.from(daysSet).sort((a, b) => a - b);

    // 5. Build result rows with summary
    const students = Object.values(studentMap)
        .sort((a, b) => a.roll_number.localeCompare(b.roll_number))
        .map(st => {
            let present = 0, absent = 0;

            const daysOut = {};
            days.forEach(d => {
                const s = st.dayMap[d] || null;
                daysOut[d] = s;
                if (!s) return;
                if (s === 'ABSENT') absent++;
                else present++; // PRESENT, OD, IL all count as present
            });

            const total = present + absent;
            const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

            return {
                student_id: st.student_id,
                name: st.name,
                roll_number: st.roll_number,
                days: daysOut,
                present,
                absent,
                total,
                percentage,
            };
        });

    return { subject, month, days, students };
}

module.exports = { getStaffSubjects, getMonthlyRegister };

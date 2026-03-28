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

    // 2. Fetch all attendance records for this subject/month by this staff
    //    Each row = one period record; we collapse by student+date below.
    const records = await sequelize.query(`
        SELECT
            ar.student_id,
            s.name,
            s.roll_number,
            DAY(ar.date)  AS day_num,
            ar.status,
            ar.od_reason
        FROM attendance_records ar
        JOIN students s ON s.student_id = ar.student_id
        WHERE ar.subject_id = :subject_id
          AND ar.submitted_by = :staffUserId
          AND ar.date BETWEEN :dateFrom AND :dateTo
        ORDER BY s.roll_number, ar.date, ar.slot_id
    `, { replacements: { subject_id, staffUserId, dateFrom, dateTo }, type: QueryTypes.SELECT });

    // 3. Group by student, then by day
    //    For a given day, if ANY period is ABSENT → show A
    //    If ANY is OD / INFORMED_LEAVE → show OD
    //    Otherwise → P
    const studentMap = {};

    records.forEach(r => {
        const sid = r.student_id;
        if (!studentMap[sid]) {
            studentMap[sid] = {
                student_id: sid,
                name: r.name,
                roll_number: r.roll_number,
                dayMap: {},    // day_num → dominant status
            };
        }

        const existing = studentMap[sid].dayMap[r.day_num];
        // Priority: ABSENT > OD/IL > PRESENT
        if (!existing) {
            studentMap[sid].dayMap[r.day_num] = r.status;
        } else if (r.status === 'ABSENT') {
            studentMap[sid].dayMap[r.day_num] = 'ABSENT';
        } else if (['OD', 'INFORMED_LEAVE'].includes(r.status) && existing === 'PRESENT') {
            studentMap[sid].dayMap[r.day_num] = r.status;
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

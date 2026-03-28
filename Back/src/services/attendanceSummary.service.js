// src/services/attendanceSummary.service.js
// Fresh service for the attendance summary table feature.
// No reuse of existing services — standalone raw SQL queries.

const { sequelize } = require('../models/index');
const { QueryTypes } = require('sequelize');

/**
 * GET /api/attendance-summary/year-table?date=YYYY-MM-DD&year=1|2|3|4
 *
 * Returns rows: [{ year, present, absent, total }] for the given date.
 * If `year` is provided (YC scope), only that year is returned.
 * If no `year` (Principal scope), all 4 years are returned.
 *
 * Counts per student per day across all periods (slot_id 1–5).
 * A student is PRESENT for the day if they have at least one PRESENT/OD/INFORMED_LEAVE record.
 * A student is ABSENT for the day if ALL their records are ABSENT.
 */
async function getYearSummaryTable({ date, year }) {
    const conditions = ['ar.date = :date'];
    const replacements = { date };

    if (year) {
        conditions.push('s.current_year = :year');
        replacements.year = Number(year);
    }

    const rows = await sequelize.query(`
        SELECT
            s.current_year                                          AS year,
            COUNT(DISTINCT s.student_id)                           AS total,
            COUNT(DISTINCT CASE
                WHEN day_stat.is_present = 1 THEN s.student_id
            END)                                                   AS present,
            COUNT(DISTINCT CASE
                WHEN day_stat.is_present = 0 THEN s.student_id
            END)                                                   AS absent
        FROM students s
        JOIN (
            SELECT
                ar2.student_id,
                MAX(ar2.status IN ('PRESENT','OD','INFORMED_LEAVE')) AS is_present
            FROM attendance_records ar2
            WHERE ar2.date = :date
            GROUP BY ar2.student_id
        ) AS day_stat ON day_stat.student_id = s.student_id
        JOIN attendance_records ar ON ar.student_id = s.student_id
        WHERE ${conditions.join(' AND ')}
        GROUP BY s.current_year
        ORDER BY s.current_year
    `, { replacements, type: QueryTypes.SELECT });

    return rows;
}

/**
 * GET /api/attendance-summary/student-detail?date=YYYY-MM-DD&year=1|2|3|4&status=ABSENT|PRESENT
 *
 * Returns students for given date + year + status,
 * with a period-by-period breakdown (period_now, period1..period5).
 * Also includes od_reason if any period has OD/INFORMED_LEAVE.
 *
 * `status` param: 'ABSENT' means all-periods-absent students,
 *                 'PRESENT' means at least one present.
 */
async function getStudentDayDetail({ date, year, status }) {
    if (!date || !year || !status) throw new Error('date, year, and status are required');

    const replacements = { date, year: Number(year) };

    // Step 1: Get all students in the year that have records that day
    const students = await sequelize.query(`
        SELECT DISTINCT
            s.student_id,
            s.name,
            s.roll_number
        FROM students s
        JOIN attendance_records ar ON ar.student_id = s.student_id
        WHERE ar.date = :date AND s.current_year = :year
        ORDER BY s.roll_number
    `, { replacements, type: QueryTypes.SELECT });

    // Step 2: Get all records for these students on this day (all periods)
    const records = await sequelize.query(`
        SELECT
            ar.student_id,
            ar.slot_id,
            ts.slot_number,
            ar.status,
            ar.od_reason
        FROM attendance_records ar
        JOIN timetable_slots ts ON ts.slot_id = ar.slot_id
        WHERE ar.date = :date
          AND ar.student_id IN (
            SELECT s2.student_id FROM students s2
            WHERE s2.current_year = :year
          )
        ORDER BY ar.student_id, ts.slot_number
    `, { replacements, type: QueryTypes.SELECT });

    // Step 3: Group records by student
    const recordMap = {};
    records.forEach((r) => {
        if (!recordMap[r.student_id]) recordMap[r.student_id] = [];
        recordMap[r.student_id].push(r);
    });

    // Step 4: Build per-student row with period1..period5
    const result = students
        .map((st) => {
            const periods = recordMap[st.student_id] || [];
            const row = {
                student_id: st.student_id,
                name: st.name,
                roll_number: st.roll_number,
                period_now: periods.length,
                period1: null,
                period2: null,
                period3: null,
                period4: null,
                period5: null,
                od_reason: null,
            };

            periods.forEach((p) => {
                const key = `period${p.slot_number}`;
                row[key] = p.status;
                if (p.od_reason) row.od_reason = p.od_reason;
            });

            // Determine if student is present or absent for the day
            const hasPresent = periods.some((p) =>
                ['PRESENT', 'OD', 'INFORMED_LEAVE'].includes(p.status)
            );
            row.day_status = hasPresent ? 'PRESENT' : 'ABSENT';

            return row;
        })
        .filter((row) => {
            if (status === 'ABSENT') return row.day_status === 'ABSENT';
            if (status === 'PRESENT') return row.day_status === 'PRESENT';
            return true;
        });

    return result;
}

module.exports = { getYearSummaryTable, getStudentDayDetail };

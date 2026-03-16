// src/services/report.service.js
// All report SQL queries extracted from routes into a proper service layer.

const { sequelize } = require('../models/index');
const { QueryTypes } = require('sequelize');

/**
 * Resolve year scope: YC sees only their managed year, Principal can filter.
 */
function yearScope(currentUser, query) {
    if (currentUser.role === 'YEAR_COORDINATOR') return currentUser.managedYear;
    return query.year ? Number(query.year) : null;
}

/**
 * GET /reports/attendance-summary
 * Summarises each student's attendance % with optional filters.
 */
async function getAttendanceSummary({ year, semester_id, date_from, date_to }) {
    const replacements = {};
    const conditions = ['1=1'];

    if (year) {
        conditions.push('s.current_year = :year');
        replacements.year = year;
    }
    if (semester_id) {
        conditions.push('ar.semester_id = :semId');
        replacements.semId = Number(semester_id);
    }
    if (date_from && date_to) {
        conditions.push('ar.date BETWEEN :dateFrom AND :dateTo');
        replacements.dateFrom = date_from;
        replacements.dateTo = date_to;
    }

    return sequelize.query(`
        SELECT
            s.student_id, s.name, s.roll_number, s.current_year,
            COUNT(ar.record_id) AS total_periods,
            SUM(ar.status IN ('PRESENT','OD','INFORMED_LEAVE')) AS attended,
            ROUND(
                SUM(ar.status IN ('PRESENT','OD','INFORMED_LEAVE')) * 100.0
                / NULLIF(COUNT(ar.record_id), 0), 2
            ) AS attendance_pct
        FROM students s
        LEFT JOIN attendance_records ar ON ar.student_id = s.student_id
        WHERE ${conditions.join(' AND ')}
        GROUP BY s.student_id
        ORDER BY s.current_year, s.roll_number
    `, { replacements, type: QueryTypes.SELECT });
}

/**
 * GET /reports/below-threshold
 * Lists students below a given attendance %.
 */
async function getBelowThreshold({ year, semester_id, threshold = 80 }) {
    const replacements = { threshold: Number(threshold) };
    const conditions = ['1=1'];

    if (year) {
        conditions.push('s.current_year = :year');
        replacements.year = year;
    }
    if (semester_id) {
        conditions.push('ar.semester_id = :semId');
        replacements.semId = Number(semester_id);
    }

    return sequelize.query(`
        SELECT
            s.student_id, s.name, s.roll_number, s.current_year, s.parent_phone,
            ROUND(
                SUM(ar.status IN ('PRESENT','OD','INFORMED_LEAVE')) * 100.0
                / NULLIF(COUNT(ar.record_id), 0), 2
            ) AS attendance_pct
        FROM students s
        JOIN attendance_records ar ON ar.student_id = s.student_id
        WHERE ${conditions.join(' AND ')}
        GROUP BY s.student_id
        HAVING attendance_pct < :threshold
        ORDER BY attendance_pct ASC
    `, { replacements, type: QueryTypes.SELECT });
}

/**
 * GET /reports/by-student/:id
 * Detailed attendance history for a single student.
 */
async function getByStudent(studentId) {
    return sequelize.query(`
        SELECT
            ar.date, ar.slot_id, ar.status, ar.od_reason,
            sub.subject_name, ts.slot_number, ts.start_time
        FROM attendance_records ar
        LEFT JOIN subjects sub ON sub.subject_id = ar.subject_id
        LEFT JOIN timetable_slots ts ON ts.slot_id = ar.slot_id
        WHERE ar.student_id = :studentId
        ORDER BY ar.date DESC, ts.slot_number ASC
    `, { replacements: { studentId }, type: QueryTypes.SELECT });
}

/**
 * GET /reports/subject-wise
 * Per-student per-subject attendance breakdown.
 */
async function getSubjectWise({ year, semester_id, date_from, date_to }) {
    const replacements = { year };

    // 1. Get subjects for this year
    const subjects = await sequelize.query(`
        SELECT subject_id, subject_name, subject_code
        FROM subjects
        WHERE subject_year = :year
        ORDER BY subject_name
    `, { replacements: { year }, type: QueryTypes.SELECT });

    // 2. Build join conditions
    const joinConditions = [];
    if (date_from && date_to) {
        joinConditions.push('AND ar.date BETWEEN :dateFrom AND :dateTo');
        replacements.dateFrom = date_from;
        replacements.dateTo = date_to;
    }
    if (semester_id) {
        joinConditions.push('AND ar.semester_id = :semId');
        replacements.semId = Number(semester_id);
    }

    // 3. Get per-student per-subject attendance
    const records = await sequelize.query(`
        SELECT
            s.student_id, s.name, s.roll_number, s.current_year,
            ar.subject_id,
            COUNT(ar.record_id) AS total_hours,
            SUM(ar.status IN ('PRESENT','OD','INFORMED_LEAVE')) AS present_hours
        FROM students s
        LEFT JOIN attendance_records ar ON ar.student_id = s.student_id
            ${joinConditions.join(' ')}
        WHERE s.current_year = :year
        GROUP BY s.student_id, ar.subject_id
        ORDER BY s.roll_number, ar.subject_id
    `, { replacements, type: QueryTypes.SELECT });

    // 4. Restructure into per-student → per-subject
    const studentMap = {};
    records.forEach(r => {
        if (!studentMap[r.student_id]) {
            studentMap[r.student_id] = {
                student_id: r.student_id,
                name: r.name,
                roll_number: r.roll_number,
                current_year: r.current_year,
                subjects: {},
            };
        }
        if (r.subject_id) {
            studentMap[r.student_id].subjects[r.subject_id] = {
                total_hours: Number(r.total_hours) || 0,
                present_hours: Number(r.present_hours) || 0,
                percentage: r.total_hours > 0
                    ? Math.round((Number(r.present_hours) / Number(r.total_hours)) * 100)
                    : 0,
            };
        }
    });

    return { subjects, students: Object.values(studentMap) };
}

module.exports = { yearScope, getAttendanceSummary, getBelowThreshold, getByStudent, getSubjectWise };

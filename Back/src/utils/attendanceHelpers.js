// src/utils/attendanceHelpers.js
// Shared attendance transformations used across services

const { Semester } = require('../models/index');
const AppError = require('./AppError');

/**
 * Resolve od_reason based on status.
 * Preserves existing reason if present; only sets defaults for PRESENT/ABSENT.
 */
function resolveODReason(status, existingReason = null) {
    if (existingReason) return existingReason;
    if (!status) return null;
    const upper = status.toUpperCase();
    if (upper === 'PRESENT') return null;
    if (upper === 'ABSENT') return 'uninformed_leave';
    return existingReason;
}

/** Fetch or throw active semester */
async function getActiveSemester() {
    const semester = await Semester.findOne({ where: { is_active: true } });
    if (!semester) throw new AppError('NO_ACTIVE_SEMESTER', 'No active semester found', 422);
    return semester;
}

/**
 * Build a student response object from raw student + attendance data.
 * Used in both submit() and correctStaffSubmit() return transformations.
 */
function formatStudentAttendance(student, attendanceRecord) {
    const status = attendanceRecord?.status || null;
    const od_reason = resolveODReason(status, attendanceRecord?.od_reason || null);
    return {
        student_id: student.student_id,
        rollno: student.roll_number,
        name: student.name,
        year: student.current_year,
        status,
        od_reason,
        is_locked: !!attendanceRecord?.is_locked,
    };
}

module.exports = { resolveODReason, getActiveSemester, formatStudentAttendance };

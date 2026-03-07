// models/index.js — Load all models and define associations

const sequelize = require('../config/db');

const User = require('./User');
const Batch = require('./Batch');
const Semester = require('./Semester');
const Subject = require('./Subject');
const TimetableSlot = require('./TimetableSlot');
const Student = require('./Student');
const CollegeCalendar = require('./CollegeCalendar');
const StudentBatchEnrollment = require('./StudentBatchEnrollment');
const StudentSubjectEnrollment = require('./StudentSubjectEnrollment');
const AttendanceRecord = require('./AttendanceRecord');
const AttendanceAuditLog = require('./AttendanceAuditLog');
const NotificationLog = require('./NotificationLog');

// ── Student ↔ Batch ────────────────────────────────────────────
Student.belongsTo(Batch, { foreignKey: 'batch_id', as: 'batch' });
Batch.hasMany(Student, { foreignKey: 'batch_id', as: 'students' });

// ── Enrollment: Student ↔ Batch ↔ Semester ────────────────────
StudentBatchEnrollment.belongsTo(Student, { foreignKey: 'student_id' });
StudentBatchEnrollment.belongsTo(Batch, { foreignKey: 'batch_id' });
StudentBatchEnrollment.belongsTo(Semester, { foreignKey: 'semester_id' });

// ── Enrollment: Student ↔ Subject ↔ Semester ──────────────────
StudentSubjectEnrollment.belongsTo(Student, { foreignKey: 'student_id' });
StudentSubjectEnrollment.belongsTo(Subject, { foreignKey: 'subject_id' });
StudentSubjectEnrollment.belongsTo(Semester, { foreignKey: 'semester_id' });

// ── Attendance Records ─────────────────────────────────────────
AttendanceRecord.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
AttendanceRecord.belongsTo(Semester, { foreignKey: 'semester_id', as: 'semester' });
AttendanceRecord.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });
AttendanceRecord.belongsTo(TimetableSlot, { foreignKey: 'slot_id', as: 'slot' });
AttendanceRecord.belongsTo(User, { foreignKey: 'submitted_by', as: 'submitter' });
Student.hasMany(AttendanceRecord, { foreignKey: 'student_id', as: 'attendanceRecords' });

// ── Audit Log ──────────────────────────────────────────────────
AttendanceAuditLog.belongsTo(AttendanceRecord, { foreignKey: 'record_id', as: 'record' });
AttendanceAuditLog.belongsTo(User, { foreignKey: 'changed_by', as: 'changedBy' });
AttendanceRecord.hasMany(AttendanceAuditLog, { foreignKey: 'record_id', as: 'auditLogs' });

// ── Notification Log ───────────────────────────────────────────
NotificationLog.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
NotificationLog.belongsTo(Semester, { foreignKey: 'semester_id', as: 'semester' });

// ── College Calendar (declared by Principal) ───────────────────
CollegeCalendar.belongsTo(User, { foreignKey: 'declared_by', as: 'declaredBy' });

module.exports = {
    sequelize,
    User,
    Batch,
    Semester,
    Subject,
    TimetableSlot,
    Student,
    CollegeCalendar,
    StudentBatchEnrollment,
    StudentSubjectEnrollment,
    AttendanceRecord,
    AttendanceAuditLog,
    NotificationLog,
};

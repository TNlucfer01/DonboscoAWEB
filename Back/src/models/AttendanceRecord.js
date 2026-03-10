const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AttendanceRecord = sequelize.define('AttendanceRecord', {
    record_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'students', key: 'student_id' },
    },
    semester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'semesters', key: 'semester_id' },
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Staff picks subject at mark-time
        references: { model: 'subjects', key: 'subject_id' },
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    slot_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'timetable_slots', key: 'slot_id' },
    },
    status: {
        type: DataTypes.ENUM('PRESENT', 'ABSENT', 'OD', 'INFORMED_LEAVE'),
        allowNull: false,
    },
    od_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    submitted_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
    },
    submitted_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    is_locked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'attendance_records',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['student_id', 'date', 'slot_id', 'semester_id'],
        },
    ],
});
//no issue for now except the rool no b acts a  the id 
module.exports = AttendanceRecord;

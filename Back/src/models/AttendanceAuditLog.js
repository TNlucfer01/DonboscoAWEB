const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
// TODO: Support batch audit log entries when correcting multiple slots at once
const AttendanceAuditLog = sequelize.define('AttendanceAuditLog', {
    audit_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    record_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'attendance_records', key: 'record_id' },
    },
    changed_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
    },
    old_status: {
        type: DataTypes.ENUM('PRESENT', 'ABSENT', 'OD', 'INFORMED_LEAVE'),
        allowNull: false,
    },
    new_status: {
        type: DataTypes.ENUM('PRESENT', 'ABSENT', 'OD', 'INFORMED_LEAVE'),
        allowNull: false,
    },
    changed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'attendance_audit_log',
    timestamps: false,
});

module.exports = AttendanceAuditLog;

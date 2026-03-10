const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
//not used right now 
const NotificationLog = sequelize.define('NotificationLog', {
    log_id: {
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
    sent_to_phone: {
        type: DataTypes.STRING(15),
        allowNull: false, // Snapshot of parent_phone at send time
    },
    trigger_type: {
        type: DataTypes.ENUM('PER_PERIOD', 'MONTHLY_SUMMARY'),
        allowNull: false,
    },
    trigger_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    attendance_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    message_sent: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    sent_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('SENT', 'FAILED'),
        allowNull: false,
    },
}, {
    tableName: 'notification_log',
    timestamps: false,
});

module.exports = NotificationLog;

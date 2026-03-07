const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentBatchEnrollment = sequelize.define('StudentBatchEnrollment', {
    enrollment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'students', key: 'student_id' },
    },
    batch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'batches', key: 'batch_id' },
    },
    semester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'semesters', key: 'semester_id' },
    },
}, {
    tableName: 'student_batch_enrollment',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['student_id', 'batch_id', 'semester_id'],
        },
    ],
});

module.exports = StudentBatchEnrollment;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
//okay i think 
const StudentSubjectEnrollment = sequelize.define('StudentSubjectEnrollment', {
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
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'subjects', key: 'subject_id' },
    },
    semester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'semesters', key: 'semester_id' },
    },
}, {
    tableName: 'student_subject_enrollment',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['student_id', 'subject_id', 'semester_id'],
        },
    ],
});

module.exports = StudentSubjectEnrollment;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Semester = sequelize.define('Semester', {
    semester_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    academic_year: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: { min: 1, max: 4 },
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'semesters',
    timestamps: false,
});

module.exports = Semester;

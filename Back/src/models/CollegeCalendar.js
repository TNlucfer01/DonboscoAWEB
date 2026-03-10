const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CollegeCalendar = sequelize.define('CollegeCalendar', {
    calendar_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true,
    },
    day_type: {
        type: DataTypes.ENUM('WORKING', 'HOLIDAY', 'SATURDAY_ENABLED'),
        allowNull: false,
    },
    holiday_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    holiday_description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    declared_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
    },
    declared_on: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
}, {
    tableName: 'college_calendar',
    timestamps: false,
});
//ok
module.exports = CollegeCalendar;

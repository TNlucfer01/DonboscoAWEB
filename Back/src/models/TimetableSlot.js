const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
// okay 
const TimetableSlot = sequelize.define('TimetableSlot', {
    slot_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    slot_number: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: { min: 1, max: 5 },
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    slot_type: {
        type: DataTypes.ENUM('THEORY', 'LAB', 'OTHER'),
        allowNull: false,
    },
}, {
    tableName: 'timetable_slots',
    timestamps: false,
});

module.exports = TimetableSlot;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LabBatch = sequelize.define('LabBatch', {
    lab_batch_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    year: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: { min: 1, max: 4 },
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    student_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'lab_batches',
    timestamps: false,
});
//ok i think 
module.exports = LabBatch;

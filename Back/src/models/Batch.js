const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Batch = sequelize.define('Batch', {
    batch_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    batch_type: {
        type: DataTypes.ENUM('THEORY', 'LAB'),
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
    tableName: 'batches',
    timestamps: false,
});

module.exports = Batch;

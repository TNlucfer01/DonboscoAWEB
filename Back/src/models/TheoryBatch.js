const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
//okay
const TheoryBatch = sequelize.define('TheoryBatch', {
    theory_batch_id: {
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
    tableName: 'theory_batches',
    timestamps: false,
});

module.exports = TheoryBatch;

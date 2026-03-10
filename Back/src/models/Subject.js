const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
//add the subject code 
const Subject = sequelize.define('Subject', {
    subject_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    subject_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    subject_year: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: { min: 1, max: 4 },
    },
    subject_description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    semester: {
        type: DataTypes.ENUM('ODD', 'EVEN'),
        allowNull: false,
    },
}, {
    tableName: 'subjects',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['subject_name', 'subject_year', 'semester'],
        },
    ],
});

module.exports = Subject;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
//add the  detils for the  future 
const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
    },
    phone_number: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
    },
    role: {
        type: DataTypes.ENUM('PRINCIPAL', 'YEAR_COORDINATOR', 'SUBJECT_STAFF'),
        allowNull: false,
    },
    managed_year: {
        type: DataTypes.TINYINT,
        allowNull: true, // NULL for Principal and Staff; 1-4 for YC
        validate: { min: 1, max: 4 },
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = User;

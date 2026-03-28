// src/services/user.service.js
const bcrypt = require('bcryptjs');
const { User } = require('../models/index');
const AppError = require('../utils/AppError');

async function getAll() {
    return User.findAll({
        where: { role: ['YEAR_COORDINATOR', 'SUBJECT_STAFF'] },
        attributes: { exclude: ['password_hash'] },
        order: [['name', 'ASC']],
    });
}

async function getById(id) {
    const user = await User.findByPk(id, { attributes: { exclude: ['password_hash'] } });
    if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);
    return user;
}

async function create(data) {
    const { name, email, phone_number, role, managed_year } = data;

    // Validate YC must have managed_year 1-4; Principal/Staff must not
    if (role === 'YEAR_COORDINATOR' && (!managed_year || managed_year < 1 || managed_year > 4)) {
        throw new AppError('VALIDATION_ERROR', 'Year coordinator must have managed_year between 1 and 4', 400);
    }
    if (role === 'YEAR_COORDINATOR' && managed_year) {
        const existingYC = await User.findOne({ where: { role: 'YEAR_COORDINATOR', managed_year } });
        if (existingYC) throw new AppError('VALIDATION_ERROR', `A Year Coordinator is already assigned to Year ${managed_year}`, 400);
    }
    if (role !== 'YEAR_COORDINATOR' && managed_year) {
        throw new AppError('VALIDATION_ERROR', 'Only Year Coordinators can have managed_year set', 400);
    }

    const hash = await bcrypt.hash('Password@123', 10); // default password
    const user = await User.create({ name, email, phone_number, role, managed_year: managed_year || null, password_hash: hash });
    const { password_hash: _, ...safe } = user.toJSON();
    return safe;
}

async function update(id, data) {
    const user = await User.findByPk(id);
    if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);
    const { name, email, phone_number, role, managed_year } = data;
    
    // Validate YC duplicate assignment
    if (role === 'YEAR_COORDINATOR' && managed_year) {
        const existingYC = await User.findOne({ where: { role: 'YEAR_COORDINATOR', managed_year } });
        if (existingYC && existingYC.user_id !== Number(id)) throw new AppError('VALIDATION_ERROR', `A Year Coordinator is already assigned to Year ${managed_year}`, 400);
    }

    await user.update({ name, email, phone_number, role, managed_year });
    const { password_hash: _, ...safe } = user.toJSON();
    return safe;
}

async function remove(id) {
    const user = await User.findByPk(id);
    if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);
    if (user.role === 'PRINCIPAL') throw new AppError('FORBIDDEN', 'Cannot delete the Principal account', 403);
    await user.destroy();
    return { message: 'User deleted successfully' };
}

module.exports = { getAll, getById, create, update, remove };

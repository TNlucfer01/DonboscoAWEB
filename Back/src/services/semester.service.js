// src/services/semester.service.js
const { Semester, sequelize } = require('../models/index');
const AppError = require('../utils/AppError');

async function getAll() {
    return Semester.findAll({ order: [['academic_year', 'ASC'], ['name', 'ASC']] });
}

async function activate(semesterId) {
    const semester = await Semester.findByPk(semesterId);
    if (!semester) throw new AppError('NOT_FOUND', 'Semester not found', 404);

    // Deactivate all, then activate the selected one — in a transaction
    await sequelize.transaction(async (t) => {
        await Semester.update({ is_active: false }, { where: {}, transaction: t });
        await semester.update({ is_active: true }, { transaction: t });
    });

    return semester.reload();
}

module.exports = { getAll, activate };

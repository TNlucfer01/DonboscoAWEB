// src/services/batch.service.js
const { Batch, Student } = require('../models/index');
const AppError = require('../utils/AppError');

async function getAll(year) {
    const where = year ? { year: Number(year) } : {};
    return Batch.findAll({ where, order: [['year', 'ASC'], ['name', 'ASC']] });
}

async function getById(id) {
    const batch = await Batch.findByPk(id, { include: [{ association: 'students', attributes: ['student_id', 'name', 'roll_number'] }] });
    if (!batch) throw new AppError('NOT_FOUND', 'Batch not found', 404);
    return batch;
}

async function create(data) {
    const { name, batch_type, year, capacity } = data;
    return Batch.create({ name, batch_type, year, capacity });
}

async function update(id, data) {
    const batch = await Batch.findByPk(id);
    if (!batch) throw new AppError('NOT_FOUND', 'Batch not found', 404);
    await batch.update(data);
    return batch;
}

async function remove(id) {
    const batch = await Batch.findByPk(id);
    if (!batch) throw new AppError('NOT_FOUND', 'Batch not found', 404);
    const count = await Student.count({ where: { batch_id: id } });
    if (count > 0) throw new AppError('CONFLICT', 'Cannot delete batch with assigned students', 409);
    await batch.destroy();
    return { message: 'Batch deleted' };
}

module.exports = { getAll, getById, create, update, remove };

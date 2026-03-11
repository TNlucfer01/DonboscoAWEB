// src/services/batch.service.js
const { TheoryBatch, LabBatch, Student } = require('../models/index');
const AppError = require('../utils/AppError');

const getModel = (type) => {
    if (type === 'THEORY') return TheoryBatch;
    if (type === 'LAB') return LabBatch;
    throw new AppError('VALIDATION_ERROR', 'invalid batch_type (must be THEORY or LAB)', 400);
};

const getBatchIdKey = (type) => type === 'THEORY' ? 'theory_batch_id' : 'lab_batch_id';

async function getAll(query) {
    const { year, batch_type } = query;
    const where = year ? { year: Number(year) } : {};

    if (batch_type) {
        const Model = getModel(batch_type);
        const results = await Model.findAll({ where, order: [['year', 'ASC'], ['name', 'ASC']] });
        const idKey = getBatchIdKey(batch_type);
        return results.map(r => ({ ...r.toJSON(), batch_type, batch_id: r[idKey] }));
    }

    const theory = await TheoryBatch.findAll({ where, order: [['year', 'ASC'], ['name', 'ASC']] });
    const lab = await LabBatch.findAll({ where, order: [['year', 'ASC'], ['name', 'ASC']] });
    return [
        ...theory.map(t => ({ ...t.toJSON(), batch_type: 'THEORY', batch_id: t.theory_batch_id })),
        ...lab.map(l => ({ ...l.toJSON(), batch_type: 'LAB', batch_id: l.lab_batch_id }))
    ];
}

async function getById(id, type) {
    const Model = getModel(type);
    const batch = await Model.findByPk(id, { include: [{ association: 'students', attributes: ['student_id', 'name', 'roll_number'] }] });
    if (!batch) throw new AppError('NOT_FOUND', 'Batch not found', 404);

    const idKey = getBatchIdKey(type);
    return { ...batch.toJSON(), batch_type: type, batch_id: batch[idKey] };
}

async function create(data) {
    const { name, batch_type, year, capacity } = data;
    const Model = getModel(batch_type);
    const result = await Model.create({ name, year, capacity });
    const idKey = getBatchIdKey(batch_type);
    return { ...result.toJSON(), batch_type, batch_id: result[idKey] };
}

async function update(id, type, data) {
    const Model = getModel(type);
    const batch = await Model.findByPk(id);
    if (!batch) throw new AppError('NOT_FOUND', 'Batch not found', 404);
    await batch.update(data);

    const idKey = getBatchIdKey(type);
    return { ...batch.toJSON(), batch_type: type, batch_id: batch[idKey] };
}

async function remove(id, type) {
    const Model = getModel(type);
    const batch = await Model.findByPk(id);
    if (!batch) throw new AppError('NOT_FOUND', 'Batch not found', 404);

    const idKey = getBatchIdKey(type);
    const count = await Student.count({ where: { [idKey]: id } });

    if (count > 0) throw new AppError('CONFLICT', 'Cannot delete batch with assigned students', 409);
    await batch.destroy();
    return { message: 'Batch deleted' };
}

module.exports = { getAll, getById, create, update, remove };

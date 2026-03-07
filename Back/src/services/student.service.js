// src/services/student.service.js
const { Student, Batch } = require('../models/index');
const AppError = require('../utils/AppError');

async function getAll(query, currentUser) {
    const where = {};
    // YC sees only their year; Principal sees all
    if (currentUser.role === 'YEAR_COORDINATOR') {
        where.current_year = currentUser.managedYear;
    } else if (query.year) {
        where.current_year = Number(query.year);
    }
    if (query.batch_id) where.batch_id = Number(query.batch_id);

    return Student.findAll({
        where,
        include: [{ model: Batch, as: 'batch', attributes: ['batch_id', 'name', 'batch_type'] }],
        order: [['name', 'ASC']],
    });
}

async function getById(id) {
    const student = await Student.findByPk(id, {
        include: [{ model: Batch, as: 'batch' }],
    });
    if (!student) throw new AppError('NOT_FOUND', 'Student not found', 404);
    return student;
}

async function create(data) {
    const { name, roll_number, phone, email, dob, gender, address, parent_phone, current_year, batch_id } = data;

    const batch = await Batch.findByPk(batch_id);
    if (!batch) throw new AppError('NOT_FOUND', 'Batch not found', 404);
    if (batch.student_count >= batch.capacity) {
        throw new AppError('CAPACITY_EXCEEDED', 'Batch is at full capacity', 409);
    }

    const student = await Student.create({ name, roll_number, phone, email, dob, gender, address, parent_phone, current_year, batch_id });

    // Update batch student_count
    await batch.increment('student_count');

    return student;
}

async function update(id, data) {
    const student = await Student.findByPk(id);
    if (!student) throw new AppError('NOT_FOUND', 'Student not found', 404);
    await student.update(data);
    return student;
}

async function remove(id) {
    const student = await Student.findByPk(id);
    if (!student) throw new AppError('NOT_FOUND', 'Student not found', 404);

    const batch = await Batch.findByPk(student.batch_id);
    await student.destroy();
    if (batch) await batch.decrement('student_count');

    return { message: 'Student removed' };
}

async function bulkCreate(rows, current_year, batch_id) {
    const batch = await Batch.findByPk(batch_id);
    if (!batch) throw new AppError('NOT_FOUND', 'Batch not found', 404);

    const students = rows.map(r => ({ ...r, current_year, batch_id }));
    const created = await Student.bulkCreate(students, { ignoreDuplicates: true });

    const count = created.filter(s => s.student_id).length;
    await batch.increment('student_count', { by: count });

    return { message: `${count} students imported` };
}

module.exports = { getAll, getById, create, update, remove, bulkCreate };

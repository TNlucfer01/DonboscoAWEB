// src/services/student.service.js
const { Student, TheoryBatch, LabBatch } = require('../models/index');
const AppError = require('../utils/AppError');


async function getAll(query, currentUser) {
    const where = {};
    // YC sees only their year; Principal sees all
    if (currentUser.role === 'YEAR_COORDINATOR') {
        where.current_year = currentUser.managedYear;
    } else if (query.year) {
        where.current_year = Number(query.year);
    }
    if (query.theory_batch_id) where.theory_batch_id = Number(query.theory_batch_id);
    if (query.lab_batch_id) where.lab_batch_id = Number(query.lab_batch_id);
    if (query.roll_number) where.roll_number = query.roll_number;

    return Student.findAll({
        where,
        include: [
            // Sequelize includes are LEFT JOINs by default — if lab_batch_id is not
            // filtered, all students still appear with their batch info attached
            { model: TheoryBatch, as: 'theoryBatch', attributes: ['theory_batch_id', 'name'] },
            { model: LabBatch, as: 'labBatch', attributes: ['lab_batch_id', 'name'] }
        ],
        order: [['name', 'ASC']],
    });
}

async function getById(id) {
    // Looks up by roll_number — the `:id` URL param is actually the roll number
    const student = await Student.findOne({
        where: { roll_number: id },
        include: [
            { model: TheoryBatch, as: 'theoryBatch' },
            { model: LabBatch, as: 'labBatch' }
        ],
    });
    if (!student) throw new AppError('NOT_FOUND', 'Student not found', 404);
    return student;
}

async function create(data) {
    const { name, roll_number, phone, email, dob, gender, address, parent_phone, current_year, theory_batch_id, lab_batch_id } = data;

    // Validate batch exists and has room before creating student
    const theoryBatch = await TheoryBatch.findByPk(theory_batch_id);
    if (!theoryBatch) throw new AppError('NOT_FOUND', 'Theory Batch not found', 404);
    if (theoryBatch.student_count >= theoryBatch.capacity) {
        throw new AppError('CAPACITY_EXCEEDED', 'Theory Batch is at full capacity', 409);
    }

    const labBatch = await LabBatch.findByPk(lab_batch_id);
    if (!labBatch) throw new AppError('NOT_FOUND', 'Lab Batch not found', 404);
    if (labBatch.student_count >= labBatch.capacity) {
        throw new AppError('CAPACITY_EXCEEDED', 'Lab Batch is at full capacity', 409);
    }

    const student = await Student.create({ name, roll_number, phone, email, dob, gender, address, parent_phone, current_year, theory_batch_id, lab_batch_id });

    // Update batch student_count
    await theoryBatch.increment('student_count');
    await labBatch.increment('student_count');

    return student;
}

async function update(id, data) {
    const student = await Student.findOne({ where: { roll_number: id } });
    if (!student) throw new AppError('NOT_FOUND', 'Student not found', 404);
    await student.update(data);
    return student;
}

async function remove(id) {
    const student = await Student.findOne({ where: { roll_number: id } });
    if (!student) throw new AppError('NOT_FOUND', 'Student not found', 404);

    const theoryBatch = await TheoryBatch.findByPk(student.theory_batch_id);
    const labBatch = await LabBatch.findByPk(student.lab_batch_id);

    await student.destroy();

    if (theoryBatch) await theoryBatch.decrement('student_count');
    if (labBatch) await labBatch.decrement('student_count');

    return { message: 'Student removed' };
}


async function bulkCreate(rows, current_year, theory_batch_id, lab_batch_id) {
    const theoryBatch = await TheoryBatch.findByPk(theory_batch_id);
    if (!theoryBatch) throw new AppError('NOT_FOUND', 'Theory Batch not found', 404);

    const labBatch = await LabBatch.findByPk(lab_batch_id);
    if (!labBatch) throw new AppError('NOT_FOUND', 'Lab Batch not found', 404);

    const students = rows.map(r => ({ ...r, current_year, theory_batch_id, lab_batch_id }));
    const created = await Student.bulkCreate(students, { ignoreDuplicates: true });

    const count = created.filter(s => s.student_id).length;
    await theoryBatch.increment('student_count', { by: count });
    await labBatch.increment('student_count', { by: count });

    return { message: `${count} students imported` };
}

module.exports = { getAll, getById, create, update, remove, bulkCreate };

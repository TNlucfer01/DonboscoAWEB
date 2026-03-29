// src/services/student.service.js
const { Student, TheoryBatch, LabBatch, sequelize } = require('../models/index');
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

    const existing = await Student.findOne({ where: { roll_number } });
    if (existing) throw new AppError('VALIDATION_ERROR', `Roll number '${roll_number}' already exists`, 400);

    return sequelize.transaction(async (t) => {
        const theoryBatch = await TheoryBatch.findByPk(theory_batch_id, { transaction: t });
        if (!theoryBatch) throw new AppError('NOT_FOUND', 'Theory Batch not found', 404);
        if (theoryBatch.student_count >= theoryBatch.capacity) {
            throw new AppError('CAPACITY_EXCEEDED', 'Theory Batch is at full capacity', 409);
        }

        const labBatch = await LabBatch.findByPk(lab_batch_id, { transaction: t });
        if (!labBatch) throw new AppError('NOT_FOUND', 'Lab Batch not found', 404);
        if (labBatch.student_count >= labBatch.capacity) {
            throw new AppError('CAPACITY_EXCEEDED', 'Lab Batch is at full capacity', 409);
        }

        const student = await Student.create({ name, roll_number, phone, email, dob, gender, address, parent_phone, current_year, theory_batch_id, lab_batch_id }, { transaction: t });

        await theoryBatch.increment('student_count', { by: 1, transaction: t });
        await labBatch.increment('student_count', { by: 1, transaction: t });

        return student;
    });
}

async function update(id, data) {
    return sequelize.transaction(async (t) => {
        const student = await Student.findOne({ where: { roll_number: id }, transaction: t });
        if (!student) throw new AppError('NOT_FOUND', 'Student not found', 404);

        const oldTheory = student.theory_batch_id;
        const oldLab = student.lab_batch_id;
        const newTheory = data.theory_batch_id || oldTheory;
        const newLab = data.lab_batch_id || oldLab;

        await student.update(data, { transaction: t });

        if (oldTheory !== newTheory) {
            const ob = await TheoryBatch.findByPk(oldTheory, { transaction: t });
            const nb = await TheoryBatch.findByPk(newTheory, { transaction: t });
            if (ob) await ob.decrement('student_count', { by: 1, transaction: t });
            if (nb) {
                if (nb.student_count >= nb.capacity) throw new AppError('CAPACITY_EXCEEDED', `Theory Batch ${nb.name} is at full capacity`, 409);
                await nb.increment('student_count', { by: 1, transaction: t });
            }
        }

        if (oldLab !== newLab) {
            const ob = await LabBatch.findByPk(oldLab, { transaction: t });
            const nb = await LabBatch.findByPk(newLab, { transaction: t });
            if (ob) await ob.decrement('student_count', { by: 1, transaction: t });
            if (nb) {
                if (nb.student_count >= nb.capacity) throw new AppError('CAPACITY_EXCEEDED', `Lab Batch ${nb.name} is at full capacity`, 409);
                await nb.increment('student_count', { by: 1, transaction: t });
            }
        }

        return student;
    });
}

async function remove(id) {
    return sequelize.transaction(async (t) => {
        const student = await Student.findOne({ where: { roll_number: id }, transaction: t });
        if (!student) throw new AppError('NOT_FOUND', 'Student not found', 404);

        const theoryBatch = await TheoryBatch.findByPk(student.theory_batch_id, { transaction: t });
        const labBatch = await LabBatch.findByPk(student.lab_batch_id, { transaction: t });

        await student.destroy({ transaction: t });

        if (theoryBatch) await theoryBatch.decrement('student_count', { by: 1, transaction: t });
        if (labBatch) await labBatch.decrement('student_count', { by: 1, transaction: t });

        return { message: 'Student removed' };
    });
}


async function bulkCreate(rows, current_year, theory_batch_id, lab_batch_id) {
    return sequelize.transaction(async (t) => {
        const theoryBatch = await TheoryBatch.findByPk(theory_batch_id, { transaction: t });
        if (!theoryBatch) throw new AppError('NOT_FOUND', 'Theory Batch not found', 404);

        const labBatch = await LabBatch.findByPk(lab_batch_id, { transaction: t });
        if (!labBatch) throw new AppError('NOT_FOUND', 'Lab Batch not found', 404);

        // Filter out existing roll numbers manually to count accurately
        const rollNumbers = rows.map(r => r.roll_number);
        const existingStudents = await Student.findAll({
            where: { roll_number: rollNumbers },
            attributes: ['roll_number'],
            transaction: t
        });
        const existingSet = new Set(existingStudents.map(e => e.roll_number));
        
        const studentsToCreate = rows
            .filter(r => !existingSet.has(r.roll_number))
            .map(r => ({ ...r, current_year, theory_batch_id, lab_batch_id }));

        if (studentsToCreate.length === 0) {
           return { message: `0 students imported. All ${rows.length} already exist.` };
        }

        if (theoryBatch.student_count + studentsToCreate.length > theoryBatch.capacity) {
            throw new AppError('CAPACITY_EXCEEDED', `Theory Batch capacity exceeded! Tried to add ${studentsToCreate.length} to batch with ${theoryBatch.capacity - theoryBatch.student_count} slots.`, 409);
        }
        if (labBatch.student_count + studentsToCreate.length > labBatch.capacity) {
            throw new AppError('CAPACITY_EXCEEDED', `Lab Batch capacity exceeded! Tried to add ${studentsToCreate.length} to batch with ${labBatch.capacity - labBatch.student_count} slots.`, 409);
        }

        await Student.bulkCreate(studentsToCreate, { transaction: t });

        await theoryBatch.increment('student_count', { by: studentsToCreate.length, transaction: t });
        await labBatch.increment('student_count', { by: studentsToCreate.length, transaction: t });

        return { message: `${studentsToCreate.length} students imported` };
    });
}

module.exports = { getAll, getById, create, update, remove, bulkCreate };

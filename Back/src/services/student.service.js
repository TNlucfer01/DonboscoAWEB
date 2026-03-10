// src/services/student.service.js
const { Student, TheoryBatch, LabBatch } = require('../models/index');
const AppError = require('../utils/AppError');


async function getAll(query, currentUser) { //query can ve done in two ways  lab batch and theory batch 
    const where = {};
    // YC sees only their year; Principal sees all
    if (currentUser.role === 'YEAR_COORDINATOR') {
        where.current_year = currentUser.managedYear;
    } else if (query.year) {
        where.current_year = Number(query.year);
    }
    if (query.theory_batch_id) where.theory_batch_id = Number(query.theory_batch_id); 
    if (query.lab_batch_id) where.lab_batch_id = Number(query.lab_batch_id);

    return Student.findAll({
        where,
        include: [//for linking i think 
            { model: TheoryBatch, as: 'theoryBatch', attributes: ['theory_batch_id', 'name'] },
            //what will happen when there is no lab batch is given 
												{ model: LabBatch, as: 'labBatch', attributes: ['lab_batch_id', 'name'] }
        ],//by rollno 
        order: [['name', 'ASC']],
    });
}

async function getById(id) { //by the roll no 
    const student = await Student.findByPk(id, {
								//how does this even work 
        include: [
            { model: TheoryBatch, as: 'theoryBatch' },
            { model: LabBatch, as: 'labBatch' }
        ],
    });
    if (!student) throw new AppError('NOT_FOUND', 'Student not found', 404);
    return student;
}

async function create(data) {
//why does there is no condtion  
    const { name, roll_number, phone, email, dob, gender, address, parent_phone, current_year, theory_batch_id, lab_batch_id } = data;

    const theoryBatch = await TheoryBatch.findByPk(theory_batch_id); //for veryifing the batch exist instead  of add them inside 
    if (!theoryBatch) throw new AppError('NOT_FOUND', 'Theory Batch not found', 404);
    if (theoryBatch.student_count >= theoryBatch.capacity) { //warning 
        throw new AppError('CAPACITY_EXCEEDED', 'Theory Batch is at full capacity', 409);
    }
//same as the above one 
    const labBatch = await LabBatch.findByPk(lab_batch_id);
    if (!labBatch) throw new AppError('NOT_FOUND', 'Lab Batch not found', 404);
    if (labBatch.student_count >= labBatch.capacity) {
        throw new AppError('CAPACITY_EXCEEDED', 'Lab Batch is at full capacity', 409);
    }
// this creates a new record ont he db  
    const student = await Student.create({ name, roll_number, phone, email, dob, gender, address, parent_phone, current_year, theory_batch_id, lab_batch_id });

    // Update batch student_count
    await theoryBatch.increment('student_count');
    await labBatch.increment('student_count');

    return student;
}

async function update(id, data) { //by the roll no 
    const student = await Student.findByPk(id);
    if (!student) throw new AppError('NOT_FOUND', 'Student not found', 404);
    await student.update(data);
    return student;
}

async function remove(id) { //by the roll no 
    const student = await Student.findByPk(id);
    if (!student) throw new AppError('NOT_FOUND', 'Student not found', 404);

    const theoryBatch = await TheoryBatch.findByPk(student.theory_batch_id);
    const labBatch = await LabBatch.findByPk(student.lab_batch_id);

    await student.destroy();

    if (theoryBatch) await theoryBatch.decrement('student_count');
    if (labBatch) await labBatch.decrement('student_count');

    return { message: 'Student removed' };
}


// not used so far may be for the future 
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

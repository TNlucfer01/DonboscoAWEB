// src/services/subject.service.js
const { Subject } = require('../models/index');
const AppError = require('../utils/AppError');


// Accepts year and semester for filtering
async function getAll(query) {
    const where = {};
    if (query.year) where.subject_year = Number(query.year);
    if (query.semester) where.semester = query.semester;
    if (query.subject_code) where.subject_code = query.subject_code;
    return Subject.findAll({ where, order: [['subject_year', 'ASC'], ['subject_name', 'ASC']] });
}

async function getById(id) {
    // Looks up by subject_code — the `:id` URL param is the subject code
    const subject = await Subject.findOne({ where: { subject_code: id } });
    if (!subject) throw new AppError('NOT_FOUND', 'Subject not found', 404);
    return subject;
}

async function create(data) {
    const { subject_code, subject_name, subject_year, subject_description, credits, semester } = data;
    return Subject.create({ subject_code, subject_name, subject_year, subject_description, credits, semester });
}

async function update(id, data) {
    const subject = await Subject.findOne({ where: { subject_code: id } });
    if (!subject) throw new AppError('NOT_FOUND', 'Subject not found', 404);
    await subject.update(data);
    return subject;
}

async function remove(id) {
    const subject = await Subject.findOne({ where: { subject_code: id } });
    if (!subject) throw new AppError('NOT_FOUND', 'Subject not found', 404);
    await subject.destroy();
    return { message: 'Subject deleted' };
}

module.exports = { getAll, getById, create, update, remove };

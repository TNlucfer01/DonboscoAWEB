// src/services/subject.service.js
const { Subject } = require('../models/index');
const AppError = require('../utils/AppError');

async function getAll(query) {
    const where = {};
    if (query.year) where.subject_year = Number(query.year);
    if (query.semester) where.semester = query.semester;
    return Subject.findAll({ where, order: [['subject_year', 'ASC'], ['subject_name', 'ASC']] });
}

async function getById(id) {
    const subject = await Subject.findByPk(id);
    if (!subject) throw new AppError('NOT_FOUND', 'Subject not found', 404);
    return subject;
}

async function create(data) {
    const { subject_name, subject_year, subject_description, credits, semester } = data;
    return Subject.create({ subject_name, subject_year, subject_description, credits, semester });
}

async function update(id, data) {
    const subject = await Subject.findByPk(id);
    if (!subject) throw new AppError('NOT_FOUND', 'Subject not found', 404);
    await subject.update(data);
    return subject;
}

async function remove(id) {
    const subject = await Subject.findByPk(id);
    if (!subject) throw new AppError('NOT_FOUND', 'Subject not found', 404);
    await subject.destroy();
    return { message: 'Subject deleted' };
}

module.exports = { getAll, getById, create, update, remove };

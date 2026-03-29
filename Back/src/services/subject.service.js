// src/services/subject.service.js
const { Subject, AttendanceRecord } = require('../models/index');
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
    // Looks up by subject_id
    const subject = await Subject.findOne({ where: { subject_id: id } });
    if (!subject) throw new AppError('NOT_FOUND', 'Subject not found', 404);
    return subject;
}

async function create(data) {
    const { subject_code, subject_name, subject_year, subject_description, credits, semester } = data;
    
    // Check for duplicate subject code
    const existing = await Subject.findOne({ where: { subject_code } });
    if (existing) {
        throw new AppError('VALIDATION_ERROR', `Subject code '${subject_code}' already exists`, 400);
    }

    return Subject.create({ subject_code, subject_name, subject_year, subject_description, credits, semester });
}

async function update(id, data) {
    const subject = await Subject.findOne({ where: { subject_id: id } });
    if (!subject) throw new AppError('NOT_FOUND', 'Subject not found', 404);

    // C02: Prevent changing subject_code to one that already exists on another subject
    if (data.subject_code && data.subject_code !== subject.subject_code) {
        const duplicate = await Subject.findOne({ where: { subject_code: data.subject_code } });
        if (duplicate) throw new AppError('VALIDATION_ERROR', `Subject code '${data.subject_code}' is already in use`, 400);
    }

    await subject.update(data);
    return subject;
}

async function remove(id) {
    const subject = await Subject.findOne({ where: { subject_id: id } });
    if (!subject) throw new AppError('NOT_FOUND', 'Subject not found', 404);

    // Prevent deletion if attendance records are tied to this subject
    const relatedRecords = await AttendanceRecord.count({ where: { subject_id: id } });
    if (relatedRecords > 0) {
        throw new AppError('VALIDATION_ERROR', 'Cannot delete subject because it has associated attendance records. Please unassign or archive it instead.', 400);
    }

    await subject.destroy();
    return { message: 'Subject deleted' };
}

module.exports = { getAll, getById, create, update, remove };

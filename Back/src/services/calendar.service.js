// src/services/calendar.service.js
const dayjs = require('dayjs');
const { CollegeCalendar } = require('../models/index');
const AppError = require('../utils/AppError');

async function getAll(year, month) {
    const where = {};
    if (year && month) {
        const start = `${year}-${String(month).padStart(2, '0')}-01`;
        const end = dayjs(start).endOf('month').format('YYYY-MM-DD');
        const { Op } = require('sequelize'); // Op = Sequelize operators (between, gt, lt, etc.)
        where.date = { [Op.between]: [start, end] };
    }
    return CollegeCalendar.findAll({ where, order: [['date', 'ASC']] });
}

async function create({ date, day_type, holiday_name, holiday_description, declared_by }) {
    if (dayjs(date).isBefore(dayjs(), 'day')) {
        throw new AppError('PAST_DATE', 'Cannot mark holidays on past dates', 400);
    }
    return CollegeCalendar.create({ date, day_type, holiday_name, holiday_description, declared_by, declared_on: new Date() });
}

async function update(id, { day_type, holiday_name, holiday_description }) {
    const entry = await CollegeCalendar.findByPk(id);
    if (!entry) throw new AppError('NOT_FOUND', 'Calendar entry not found', 404);
    if (dayjs(entry.date).isBefore(dayjs(), 'day')) {
        throw new AppError('PAST_DATE', 'Cannot edit past calendar entries', 400);
    }
    await entry.update({ day_type, holiday_name, holiday_description });
    return entry;
}

async function remove(id) {
    const entry = await CollegeCalendar.findByPk(id);
    if (!entry) throw new AppError('NOT_FOUND', 'Calendar entry not found', 404);
    if (dayjs(entry.date).isBefore(dayjs(), 'day')) {
        throw new AppError('PAST_DATE', 'Cannot delete past calendar entries', 400);
    }
    await entry.destroy();
    return { message: 'Calendar entry deleted' };
}

module.exports = { getAll, create, update, remove };

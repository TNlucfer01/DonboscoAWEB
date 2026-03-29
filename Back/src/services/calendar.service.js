// src/services/calendar.service.js
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { CollegeCalendar } = require('../models/index');
const AppError = require('../utils/AppError');

dayjs.extend(utc);
dayjs.extend(timezone);
const IST = 'Asia/Kolkata';

async function getAll(year, month) {
    const where = {};
    // E02: Default to current year+month if no filter to avoid loading all-time holidays
    const targetYear = year || dayjs().tz(IST).format('YYYY');
    const targetMonth = month || dayjs().tz(IST).format('M');
    const start = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const end = dayjs(start).endOf('month').format('YYYY-MM-DD');
    const { Op } = require('sequelize');
    where.date = { [Op.between]: [start, end] };
    return CollegeCalendar.findAll({ where, order: [['date', 'ASC']] });
}

async function create({ date, day_type, holiday_name, holiday_description, declared_by }) {
    // E01: Use IST-aware comparison so server UTC midnight doesn't block valid evening submissions
    const todayIST = dayjs().tz(IST).startOf('day');
    const targetIST = dayjs.tz(date, IST).startOf('day');
    if (targetIST.isBefore(todayIST)) {
        throw new AppError('PAST_DATE', 'Cannot mark holidays on past dates', 400);
    }

    // E03: Prevent duplicate entries for the same date
    const existing = await CollegeCalendar.findOne({ where: { date } });
    if (existing) {
        throw new AppError('VALIDATION_ERROR', `A calendar entry already exists for ${date} (${existing.day_type})`, 400);
    }

    return CollegeCalendar.create({ date, day_type, holiday_name, holiday_description, declared_by, declared_on: new Date() });
}

async function update(id, { day_type, holiday_name, holiday_description }) {
    const entry = await CollegeCalendar.findByPk(id);
    if (!entry) throw new AppError('NOT_FOUND', 'Calendar entry not found', 404);
    // E01: Use IST-aware comparison
    const todayIST = dayjs().tz(IST).startOf('day');
    const entryIST = dayjs.tz(entry.date, IST).startOf('day');
    if (entryIST.isBefore(todayIST)) {
        throw new AppError('PAST_DATE', 'Cannot edit past calendar entries', 400);
    }
    await entry.update({ day_type, holiday_name, holiday_description });
    return entry;
}

async function remove(id) {
    const entry = await CollegeCalendar.findByPk(id);
    if (!entry) throw new AppError('NOT_FOUND', 'Calendar entry not found', 404);
    // E01: Use IST-aware comparison
    const todayIST = dayjs().tz(IST).startOf('day');
    const entryIST = dayjs.tz(entry.date, IST).startOf('day');
    if (entryIST.isBefore(todayIST)) {
        throw new AppError('PAST_DATE', 'Cannot delete past calendar entries', 400);
    }
    await entry.destroy();
    return { message: 'Calendar entry deleted' };
}

module.exports = { getAll, create, update, remove };

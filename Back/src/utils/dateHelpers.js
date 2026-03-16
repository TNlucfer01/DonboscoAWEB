// src/utils/dateHelpers.js
// Shared date validation helpers used across attendance services

const dayjs = require('dayjs');
const { CollegeCalendar } = require('../models/index');
const AppError = require('./AppError');

/** Throws if the given date is a holiday */
async function checkHoliday(date) {
    const holiday = await CollegeCalendar.findOne({ where: { date, day_type: 'HOLIDAY' } });
    if (holiday) {
        throw new AppError('HOLIDAY', `Attendance blocked: ${holiday.holiday_name || 'Holiday'}`, 422);
    }
}

/** Throws if the date is in the past */
function blockPastDate(date, message = 'Cannot perform this action for past dates') {
    if (dayjs(date).isBefore(dayjs(), 'day')) {
        throw new AppError('PAST_DATE', message, 400);
    }
}

/** Throws if the date is in the future */
function blockFutureDate(date, message = 'Cannot perform this action for future dates') {
    if (dayjs(date).isAfter(dayjs(), 'day')) {
        throw new AppError('FUTURE_DATE', message, 400);
    }
}

/** Throws if date is not today (blocks both past and future) */
function requireToday(date) {
    blockPastDate(date, 'Cannot submit attendance for past dates');
    blockFutureDate(date, 'Cannot submit attendance for future dates');
}

module.exports = { checkHoliday, blockPastDate, blockFutureDate, requireToday };

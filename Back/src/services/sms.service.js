// src/services/sms.service.js
const axios = require('axios');
const { NotificationLog, Semester } = require('../models/index');

async function sendSMS(phone, message) {
    try {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[SMS-DEV] To: ${phone} | ${message}`);
            return { status: 'dev_mode' };
        }
        const res = await axios.post('https://api.msg91.com/api/v5/flow/', {
            template_id: process.env.MSG91_TEMPLATE_ID,
            short_url: '0',
            mobiles: `91${phone}`,
            VAR1: message,
        }, {
            headers: { authkey: process.env.MSG91_AUTH_KEY },
            timeout: 5000,
        });
        return res.data;
    } catch (err) {
        console.error('[SMS] Failed to send SMS:', err.message);
        throw err;
    }
}

async function sendAbsentSMS(student, date, slot_id, semester_id) {
    const message = `Dear Parent, your ward ${student.name} was marked ABSENT for Period ${slot_id} on ${date}. - Donbosco College`;
    let smsStatus = 'SENT';

    try {
        await sendSMS(student.parent_phone, message);
    } catch {
        smsStatus = 'FAILED';
    }

    await NotificationLog.create({
        student_id: student.student_id,
        semester_id,
        sent_to_phone: student.parent_phone,
        trigger_type: 'PER_PERIOD',
        trigger_date: date,
        attendance_percentage: null,
        message_sent: message,
        sent_at: new Date(),
        status: smsStatus,
    }).catch(console.error);
}

async function sendMonthlyWarnings() {
    const { Student, AttendanceRecord, sequelize: seq } = require('../models/index');
    const { QueryTypes } = require('sequelize');

    // Query students with < 80% this semester
    const semester = await Semester.findOne({ where: { is_active: true } });
    if (!semester) return;

    const results = await seq.query(`
    SELECT s.student_id, s.name, s.parent_phone,
           ROUND(
             SUM(ar.status = 'PRESENT' OR ar.status = 'OD' OR ar.status = 'INFORMED_LEAVE') * 100.0
             / NULLIF(COUNT(ar.record_id), 0), 2
           ) AS attendance_pct
    FROM students s
    JOIN attendance_records ar ON ar.student_id = s.student_id AND ar.semester_id = :semId
    GROUP BY s.student_id
    HAVING attendance_pct < 80
  `, { replacements: { semId: semester.semester_id }, type: QueryTypes.SELECT });

    for (const student of results) {
        const message = `Dear Parent, your ward ${student.name} has ${student.attendance_pct}% attendance this semester. Minimum required: 80%. - Donbosco College`;
        let smsStatus = 'SENT';
        try {
            await sendSMS(student.parent_phone, message);
        } catch {
            smsStatus = 'FAILED';
        }
        await NotificationLog.create({
            student_id: student.student_id,
            semester_id: semester.semester_id,
            sent_to_phone: student.parent_phone,
            trigger_type: 'MONTHLY_SUMMARY',
            trigger_date: new Date().toISOString().split('T')[0],
            attendance_percentage: student.attendance_pct,
            message_sent: message,
            sent_at: new Date(),
            status: smsStatus,
        }).catch(console.error);
    }
    console.log(`✔ Monthly SMS sent to ${results.length} students below 80%`);
}

module.exports = { sendSMS, sendAbsentSMS, sendMonthlyWarnings };

// src/services/sms.service.js
// Twilio SMS integration for OTP, absent alerts & monthly warnings.

const twilio = require('twilio');
const { NotificationLog, Semester } = require('../models/index');

// ── Twilio Client ────────────────────────────────────────────────────────────
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const fromNumber  = process.env.TWILIO_PHONE_NUMBER;  // Your Twilio number (e.g. +1234567890)

let client = null;
if (accountSid && authToken && !accountSid.includes('XXXX')) {
    client = twilio(accountSid, authToken);
    console.log('[SMS] ✔ Twilio client initialized');
} else {
    console.warn('[SMS] ⚠ Twilio credentials missing — SMS will be simulated in console');
}

// ── Format phone to E.164 (India +91) ────────────────────────────────────────
function formatPhone(phone) {
    const digits = String(phone).replace(/\D/g, '');
    // If already has country code (e.g. 919944711288)
    if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
    // If just 10-digit Indian number
    if (digits.length === 10) return `+91${digits}`;
    // Fallback — prepend + if missing
    return digits.startsWith('+') ? digits : `+${digits}`;
}

// ── Core SMS sender via Twilio ───────────────────────────────────────────────
async function sendSMS(phone, message) {
    const toNumber = formatPhone(phone);

    // Dev fallback: simulate if Twilio is not configured
    if (!client) {
        console.log(`[SMS-DEV] 📱 Simulated SMS → ${toNumber}`);
        console.log(`[SMS-DEV] 💬 ${message}`);
        return { status: 'dev_simulated', to: toNumber, message };
    }

    try {
        const result = await client.messages.create({
            body: message,
            from: fromNumber,
            to: toNumber,
        });

        console.log(`[SMS] ✔ Sent to ${toNumber} | SID: ${result.sid}`);
        return { status: 'sent', sid: result.sid, to: toNumber };
    } catch (err) {
        console.error(`[SMS] ✘ Failed to send to ${toNumber}: ${err.message}`);
        throw err;
    }
}

// ── Send OTP for Forgot Password ────────────────────────────────────────────
async function sendOTPSMS(phone, otp) {
    const message = `Your DBCAMS password reset OTP is ${otp}. Valid for 10 minutes. Do not share this code. - Don Bosco College`;
    return sendSMS(phone, message);
}

// ── Per-Period Absent SMS to Parent ──────────────────────────────────────────
async function sendAbsentSMS(student, date, slot_id, semester_id) {
    const formattedDate = new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

    const message = `Dear Parent, your ward ${student.name} (${student.roll_number || ''}) was marked ABSENT for Period ${slot_id} on ${formattedDate}. Please contact the college if needed. - Don Bosco College`;

    let smsStatus = 'SENT';

    try {
        if (!student.parent_phone) {
            console.warn(`[SMS] No parent_phone for student ${student.student_id}, skipping SMS.`);
            smsStatus = 'FAILED';
        } else {
            await sendSMS(student.parent_phone, message);
        }
    } catch {
        smsStatus = 'FAILED';
    }

    // Log the notification attempt
    await NotificationLog.create({
        student_id: student.student_id,
        semester_id,
        sent_to_phone: student.parent_phone || 'N/A',
        trigger_type: 'PER_PERIOD',
        trigger_date: date,
        attendance_percentage: null,
        message_sent: message,
        sent_at: new Date(),
        status: smsStatus,
    }).catch(err => console.error('[SMS] Failed to log notification:', err.message));
}

// ── Monthly Warning for students below 80% ──────────────────────────────────
async function sendMonthlyWarnings() {
    const { Student, sequelize: seq } = require('../models/index');
    const { QueryTypes } = require('sequelize');

    const semester = await Semester.findOne({ where: { is_active: true } });
    if (!semester) {
        console.log('[SMS] No active semester — skipping monthly warnings.');
        return;
    }

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

    let sentCount = 0;
    for (const student of results) {
        const message = `Dear Parent, your ward ${student.name} has ${student.attendance_pct}% attendance this semester. Minimum required: 80%. Please ensure regular attendance. - Don Bosco College`;
        let smsStatus = 'SENT';
        try {
            await sendSMS(student.parent_phone, message);
            sentCount++;
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
        }).catch(err => console.error('[SMS] Failed to log notification:', err.message));
    }
    console.log(`[SMS] ✔ Monthly warnings sent to ${sentCount}/${results.length} students below 80%`);
}

module.exports = { sendSMS, sendOTPSMS, sendAbsentSMS, sendMonthlyWarnings };

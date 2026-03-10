// src/jobs/monthlyWarning.job.js
const cron = require('node-cron');
const smsService = require('../services/sms.service');

// Run at 11 PM on the last day of each month
// '0 23 28-31 * *' fires on days 28-31; inner check confirms it's the last day
cron.schedule('0 23 28-31 * *', async () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    if (today.getDate() === lastDay) {
        console.log('[Cron] Running monthly attendance warning SMS...');
        try {
            await smsService.sendMonthlyWarnings();
        } catch (err) {
            console.error('[Cron] Monthly warning job failed:', err.message);
        }
    }
});
//for now this is fine 
console.log('✔ Monthly warning cron job registered');

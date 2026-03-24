const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { AttendanceRecord } = require('./src/models');
const svc = require('./src/services/attendance.service');

async function test() {
    console.log("Testing saveStudentPri...");
    const records = [
        { record_id: 1, student_id: 5, status: 'ABSENT', is_locked: 1, remarks: 'nothin', od_reason: 'None' }
    ];
    await svc.saveStudentPri(records, 4);
    
    const dbRecord = await AttendanceRecord.findByPk(1);
    console.log("DB status:", dbRecord.status, "DB od_reason:", dbRecord.od_reason);
}
test().catch(console.error).then(() => process.exit(0));

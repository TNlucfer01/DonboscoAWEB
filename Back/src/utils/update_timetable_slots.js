require('../config/env');
const { sequelize } = require('../models/index');

async function run() {
    try {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
        await sequelize.query('TRUNCATE TABLE timetable_slots;');
        await sequelize.query(`
            INSERT INTO timetable_slots (slot_number, start_time, end_time, slot_type) VALUES 
            (1, '07:30:00', '10:00:00', 'LAB'), 
            (2, '10:30:00', '11:30:00', 'THEORY'), 
            (3, '11:30:00', '12:30:00', 'THEORY'), 
            (4, '13:30:00', '14:30:00', 'THEORY'), 
            (5, '14:45:00', '17:15:00', 'LAB')
        `);
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log("✔ Timetable slots updated!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();

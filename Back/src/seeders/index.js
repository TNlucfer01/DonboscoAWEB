// src/seeders/index.js — Seed initial data for development
require('../config/env');
const { sequelize, TimetableSlot, Semester, User, Batch } = require('../models/index');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: false });
        console.log('✔ DB connected and synced');

        // ── 1. Timetable Slots ────────────────────────────────────────
        await TimetableSlot.bulkCreate([
            { slot_number: 1, start_time: '07:30:00', end_time: '10:00:00', slot_type: 'LAB' },
            { slot_number: 2, start_time: '10:30:00', end_time: '11:30:00', slot_type: 'THEORY' },
            { slot_number: 3, start_time: '11:30:00', end_time: '12:30:00', slot_type: 'THEORY' },
            { slot_number: 4, start_time: '13:30:00', end_time: '14:30:00', slot_type: 'THEORY' },
            { slot_number: 5, start_time: '14:45:00', end_time: '17:15:00', slot_type: 'LAB' },
        ], { ignoreDuplicates: true });
        console.log('✔ Timetable slots seeded');

        // ── 2. Semesters (8 = 4 years × ODD + EVEN) ─────────────────
        const semesters = [];
        for (let year = 1; year <= 4; year++) {
            semesters.push({ name: `Year ${year} ODD`, academic_year: year, is_active: false });
            semesters.push({ name: `Year ${year} EVEN`, academic_year: year, is_active: false });
        }
        // Mark Year 1 ODD as active by default
        semesters[0].is_active = true;
        await Semester.bulkCreate(semesters, { ignoreDuplicates: true });
        console.log('✔ Semesters seeded (8 semesters, Year 1 ODD active)');

        // ── 3. Principal User ─────────────────────────────────────────
        const existingPrincipal = await User.findOne({ where: { role: 'PRINCIPAL' } });
        if (!existingPrincipal) {
            const hash = await bcrypt.hash('Admin@1234', 10);
            await User.create({
                name: 'Principal Admin',
                email: 'principal@donbosco.edu',
                phone_number: '9000000000',
                role: 'PRINCIPAL',
                managed_year: null,
                password_hash: hash,
            });
            console.log('✔ Principal seeded (email: principal@donbosco.edu, password: Admin@1234)');
        } else {
            console.log('ℹ Principal already exists — skipped');
        }

        // ── 4. Sample Batches (for dev testing) ───────────────────────
        await Batch.bulkCreate([
            { name: 'A1', batch_type: 'THEORY', year: 1, capacity: 60 },
            { name: 'A2', batch_type: 'THEORY', year: 1, capacity: 60 },
            { name: 'A1-LAB', batch_type: 'LAB', year: 1, capacity: 15 },
            { name: 'B1', batch_type: 'THEORY', year: 2, capacity: 60 },
            { name: 'B2', batch_type: 'THEORY', year: 2, capacity: 60 },
        ], { ignoreDuplicates: true });
        console.log('✔ Sample batches seeded');

        console.log('\n✔ Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('✘ Seeding failed:', err.message);
        process.exit(1);
    }
}

seed();

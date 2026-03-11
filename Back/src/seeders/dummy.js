require('../config/env');
const {
    sequelize,
    TimetableSlot,
    Semester,
    User,
    TheoryBatch,
    LabBatch,
    Subject,
    Student,
    StudentSubjectEnrollment,
    AttendanceRecord,
    AttendanceAuditLog
} = require('../models/index');
const bcrypt = require('bcryptjs');

async function seedDummy() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true }); // drop and recreate structure for a fresh start
        console.log('✔ DB connected and synced (force: true)');

        // ── 1. Semesters (8 = 4 years × ODD + EVEN) ─────────────────
        const semesters = [];
        let r = 1;
        for (let year = 1; year <= 4; year++) {
            semesters.push({ semester_id: r++, name: `Year ${year} ODD`, academic_year: year, is_active: false });
            semesters.push({ semester_id: r++, name: `Year ${year} EVEN`, academic_year: year, is_active: false });
        }
        semesters.forEach(s => s.is_active = (s.semester_id === 3)); // Year 2 ODD is active

        await Semester.bulkCreate(semesters);
        console.log('✔ Semesters seeded (Year 2 ODD active)');

        // ── 2. Subjects ───────────────────────────────────────────────
        // Schema: subject_code, subject_name, subject_year, subject_description, credits, semester
        await Subject.bulkCreate([
            { subject_id: 1, subject_name: 'Data Structures', subject_code: 'CS201', subject_year: 2, subject_description: 'Core concepts', credits: 4, semester: 'ODD' },
            { subject_id: 2, subject_name: 'Object Oriented Programming', subject_code: 'CS202', subject_year: 2, subject_description: 'Java programming', credits: 3, semester: 'ODD' },
            { subject_id: 3, subject_name: 'Database Management Systems', subject_code: 'CS203', subject_year: 2, subject_description: 'SQL Basics', credits: 4, semester: 'ODD' },
            { subject_id: 4, subject_name: 'Mathematics III', subject_code: 'MA201', subject_year: 2, subject_description: 'Maths', credits: 4, semester: 'ODD' },
            { subject_id: 5, subject_name: 'Computer Networks', subject_code: 'CS301', subject_year: 3, subject_description: 'Networking', credits: 3, semester: 'ODD' },
        ]);
        console.log('✔ Subjects seeded');

        // ── 3. Timetable Slots (5 Theory, 5 Lab) ───────────────────────
        await TimetableSlot.bulkCreate([
            { slot_number: 1, start_time: '08:30:00', end_time: '09:30:00', slot_type: 'THEORY' },
            { slot_number: 2, start_time: '09:30:00', end_time: '10:30:00', slot_type: 'THEORY' },
            { slot_number: 3, start_time: '10:45:00', end_time: '11:45:00', slot_type: 'THEORY' },
            { slot_number: 4, start_time: '11:45:00', end_time: '12:45:00', slot_type: 'THEORY' },
            { slot_number: 5, start_time: '13:30:00', end_time: '14:30:00', slot_type: 'THEORY' },

            { slot_number: 1, start_time: '08:30:00', end_time: '11:45:00', slot_type: 'LAB' }, // Example LAB spanning multiple hours
            { slot_number: 5, start_time: '13:30:00', end_time: '16:30:00', slot_type: 'LAB' },
        ]);
        console.log('✔ Timetable slots seeded (Theory 1-5)');

        // ── 4. Users (Principal, YC, Staff) ─────────────────────
        // Roles allowed: 'PRINCIPAL', 'YEAR_COORDINATOR', 'SUBJECT_STAFF'
        const hash = await bcrypt.hash('Password@123', 10);
        await User.bulkCreate([
            {
                user_id: 1, name: 'Principal Admin', email: 'principal@donbosco.edu', phone_number: '9000000001',
                role: 'PRINCIPAL', managed_year: null, password_hash: hash
            },
            {
                user_id: 2, name: 'Year 2 Coordinator', email: 'yc2@donbosco.edu', phone_number: '9000000002',
                role: 'YEAR_COORDINATOR', managed_year: 2, password_hash: hash
            },
            {
                user_id: 3, name: 'John Doe (Staff)', email: 'staff1@donbosco.edu', phone_number: '9000000003',
                role: 'SUBJECT_STAFF', managed_year: null, password_hash: hash
            },
            {
                user_id: 4, name: 'Jane Smith (Staff)', email: 'staff2@donbosco.edu', phone_number: '9000000004',
                role: 'SUBJECT_STAFF', managed_year: null, password_hash: hash
            }
        ]);
        console.log('✔ Users seeded (all passwords = "Password@123")');

        // ── 5. Batches ───────────────────────────────────────────────
        await TheoryBatch.bulkCreate([
            { theory_batch_id: 1, name: 'CSE-A (Year 2)', year: 2, capacity: 60, student_count: 5 },
            { theory_batch_id: 2, name: 'CSE-B (Year 2)', year: 2, capacity: 60, student_count: 5 },
            { theory_batch_id: 3, name: 'CSE-A (Year 3)', year: 3, capacity: 60, student_count: 0 },
        ]);
        await LabBatch.bulkCreate([
            { lab_batch_id: 1, name: 'CSE-A-L1 (Year 2)', year: 2, capacity: 30, student_count: 5 },
            { lab_batch_id: 2, name: 'CSE-A-L2 (Year 2)', year: 2, capacity: 30, student_count: 5 },
        ]);
        console.log('✔ Batches seeded');

        // ── 6. Students (Year 2) ─────────────────────────────────────
        const students = [];
        for (let i = 1; i <= 10; i++) {
            students.push({
                student_id: i,
                name: `Student ${i}`,
                roll_number: `24CS${String(i).padStart(3, '0')}`,
                email: `student${i}@donbosco.edu`,
                phone: `99000000${String(i).padStart(2, '0')}`,
                parent_phone: `990000009${String(i).padStart(1, '0')}`,
                current_year: 2,
                theory_batch_id: i <= 5 ? 1 : 2, // First 5 in CSE-A, next 5 in CSE-B
                lab_batch_id: i <= 5 ? 1 : 2,    // Same for lab
            });
        }
        await Student.bulkCreate(students);
        console.log('✔ Students seeded (10 students in Year 2)');

        // ── 7. Student Subject Enrollments ───────────────────────────
        const enrollments = [];
        // All students enrolled in subject_id 1 to 4 for semester_id 3
        for (let sId = 1; sId <= 10; sId++) {
            for (let subId = 1; subId <= 4; subId++) {
                enrollments.push({ student_id: sId, subject_id: subId, semester_id: 3 });
            }
        }
        await StudentSubjectEnrollment.bulkCreate(enrollments);
        console.log('✔ Student Subject Enrollments seeded');

        // ── 8. Attendance Records (Yesterday and Today) ───────────────────────
        const today = new Date();
        const yest = new Date(today);
        yest.setDate(yest.getDate() - 1);

        const formatDate = (d) => d.toISOString().split('T')[0];

        const theorySlots = await TimetableSlot.findAll({ where: { slot_type: 'THEORY' }, order: [['slot_number', 'ASC']] });

        const attendanceRecords = [];
        let recordId = 1;

        // Just for students 1-5 (CSE-A)
        for (let i = 1; i <= 5; i++) {
            // Yesterday: P1=Present, P2=Absent, P3=OD, P4=Present, P5=Present
            attendanceRecords.push({ record_id: recordId++, student_id: i, semester_id: 3, subject_id: 1, date: formatDate(yest), slot_id: theorySlots[0].slot_id, status: 'PRESENT', submitted_by: 3, is_locked: true, submitted_at: new Date() });
            attendanceRecords.push({ record_id: recordId++, student_id: i, semester_id: 3, subject_id: 2, date: formatDate(yest), slot_id: theorySlots[1].slot_id, status: 'ABSENT', submitted_by: 3, is_locked: true, submitted_at: new Date() });
            attendanceRecords.push({ record_id: recordId++, student_id: i, semester_id: 3, subject_id: 3, date: formatDate(yest), slot_id: theorySlots[2].slot_id, status: 'OD', od_reason: 'Sports', submitted_by: 2, is_locked: true, submitted_at: new Date() });
            attendanceRecords.push({ record_id: recordId++, student_id: i, semester_id: 3, subject_id: 4, date: formatDate(yest), slot_id: theorySlots[3].slot_id, status: 'PRESENT', submitted_by: 4, is_locked: true, submitted_at: new Date() });
            attendanceRecords.push({ record_id: recordId++, student_id: i, semester_id: 3, subject_id: 1, date: formatDate(yest), slot_id: theorySlots[4].slot_id, status: 'PRESENT', submitted_by: 4, is_locked: true, submitted_at: new Date() });

            // Today: Partially filled (only P1 and P2)
            attendanceRecords.push({ record_id: recordId++, student_id: i, semester_id: 3, subject_id: 1, date: formatDate(today), slot_id: theorySlots[0].slot_id, status: 'PRESENT', submitted_by: 3, is_locked: false, submitted_at: new Date() });
            attendanceRecords.push({ record_id: recordId++, student_id: i, semester_id: 3, subject_id: 2, date: formatDate(today), slot_id: theorySlots[1].slot_id, status: 'PRESENT', submitted_by: 3, is_locked: false, submitted_at: new Date() });
        }
        await AttendanceRecord.bulkCreate(attendanceRecords);
        console.log('✔ Attendance records seeded');

        console.log('\n=======================================');
        console.log('✅ ALL DUMMY DATA SEEDING COMPLETE');
        console.log('=======================================');
        console.log('Login credentials:');
        console.log('Principal : principal@donbosco.edu  / Password@123');
        console.log('YC        : yc2@donbosco.edu        / Password@123');
        console.log('Staff     : staff1@donbosco.edu     / Password@123');
        console.log('=======================================');
        process.exit(0);

    } catch (err) {
        console.error('✘ Seeding failed:', err);
        process.exit(1);
    }
}

seedDummy();

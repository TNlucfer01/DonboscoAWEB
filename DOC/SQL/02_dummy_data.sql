USE donbosco_attendance;

-- ==========================================
-- 0. INDEPENDENT TABLES
-- ==========================================

-- USERS
INSERT INTO users (name, phone_number, role, password_hash) VALUES
('Dr. Aarthi', '9876543210', 'PRINCIPAL', 'hashed_pwd_1'),
('Prof. Balaji', '8765432109', 'YEAR_COORDINATOR', 'hashed_pwd_2'),
('Mr. Chandran', '7654321098', 'SUBJECT_STAFF', 'hashed_pwd_3');

-- BATCHES
INSERT INTO batches (name, batch_type, year, capacity) VALUES
('CS A 1st Yr (T)', 'THEORY', 1, 60),
('CS B 1st Yr (T)', 'THEORY', 1, 60),
('CS A 1st Yr (L)', 'LAB', 1, 30);

-- SEMESTERS
INSERT INTO semesters (name, year) VALUES
('Semester 1', 1),
('Semester 2', 1);

-- SUBJECTS
INSERT INTO subjects (subject_name, subject_year, subject_description, credits, semester) VALUES
('Programming in C', 1, 'Basics of C programming', 4, 'Odd'),
('Engineering Mathematics I', 1, 'Calculus and Linear Algebra', 4, 'Odd'),
('Physics for Computing', 1, 'Applied Physics', 3, 'Odd');

-- TIMETABLE SLOTS are already seeded in schema, but we can add an extra if we wanted. We'll skip since 1-5 already exist.

-- ==========================================
-- 1. LEVEL 1 DEPENDENT TABLES
-- ==========================================

-- STUDENTS (Depends on batches)
-- We'll assume batch_id 1 is 'CS A 1st Yr (T)'
INSERT INTO students (name, roll_number, parent_phone, current_year, batch_id) VALUES
('Dinesh Kumar', '24CS001', '9988776655', 1, 1),
('Elango', '24CS002', '9988776644', 1, 1),
('Fathima', '24CS003', '9988776633', 1, 1);

-- COLLEGE CALENDAR (Depends on users for declared_by)
-- Let's say user_id 1 (PRINCIPAL) declared it
INSERT INTO college_calendar (date, day_type, holiday_name, holiday_description, declared_by, declared_on) VALUES
('2026-03-05', 'WORKING', NULL, NULL, 1, '2026-03-01'),
('2026-03-06', 'WORKING', NULL, NULL, 1, '2026-03-01'),
('2026-03-07', 'SATURDAY_ENABLED', 'Special Class', 'Compensatory Working Day', 1, '2026-03-01'),
('2026-03-08', 'HOLIDAY', 'Sunday', 'Weekly off', 1, '2026-03-01');

-- ==========================================
-- 2. LEVEL 2 DEPENDENT TABLES
-- ==========================================

-- STUDENT BATCH ENROLLMENT (Depends on students, batches, semesters)
-- Enroll all 3 students to batch 1, semester 1
INSERT INTO student_batch_enrollment (student_id, batch_id, semester_id) VALUES
(1, 1, 1),
(2, 1, 1),
(3, 1, 1);

-- STUDENT SUBJECT ENROLLMENT (Depends on students, subjects, semesters)
-- Enroll student 1 in all 3 subjects, student 2 in 2 subjects
INSERT INTO student_subject_enrollment (student_id, subject_id, semester_id) VALUES
(1, 1, 1),
(1, 2, 1),
(1, 3, 1),
(2, 1, 1),
(2, 2, 1);


-- ATTENDANCE RECORDS (Depends on students, semesters, timetable_slots, users)
-- Let's mark attendance for student 1 on 2026-03-05, slot 1 by User 3 (Subject Staff)
INSERT INTO attendance_records (student_id, semester_id, date, slot_id, status, od_reason, submitted_by, is_locked) VALUES
(1, 1, '2026-03-05', 1, 'PRESENT', NULL, 3, FALSE),
(2, 1, '2026-03-05', 1, 'ABSENT', NULL, 3, FALSE),
(3, 1, '2026-03-05', 1, 'OD', 'Hackathon Participation', 3, TRUE);

-- NOTIFICATION LOG (Depends on students, semesters)
INSERT INTO notification_log (student_id, semester_id, trigger_type, trigger_date, attendance_percentage, message_sent, status) VALUES
(2, 1, 'PER_PERIOD', '2026-03-05', 0.00, 'Your ward Elango was absent for Period 1 on 05-03-2026.', 'SENT');

-- ==========================================
-- 3. LEVEL 3 DEPENDENT TABLES
-- ==========================================

-- ATTENDANCE AUDIT LOG (Depends on attendance_records, users)
-- Record 2 (Elango was ABSENT), Principal changes to PRESENT
INSERT INTO attendance_audit_log (record_id, changed_by, old_status, new_status, changed_at) VALUES
(2, 1, 'ABSENT', 'PRESENT', CURRENT_TIMESTAMP);

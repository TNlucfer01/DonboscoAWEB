USE donbosco_attendance;

-- ============================================================
-- SEED TEST DATA — Full working chain in correct dependency order
-- Run this AFTER 01_schema.sql to have a complete testable state.
-- ============================================================

-- ============================================================
-- 1. BATCHES — Fixed college structure (seeded once at deployment)
-- Per year: 2 Theory batches (A=50, B=50) + 4 Lab batches (1-4=25 each)
-- 6 batches × 4 years = 24 batches total
-- ============================================================
INSERT INTO batches (name, batch_type, year, capacity) VALUES
-- Year 1
('1st Year - Theory A', 'THEORY', 1, 50),
('1st Year - Theory B', 'THEORY', 1, 50),
('1st Year - Lab 1',    'LAB',    1, 25),
('1st Year - Lab 2',    'LAB',    1, 25),
('1st Year - Lab 3',    'LAB',    1, 25),
('1st Year - Lab 4',    'LAB',    1, 25),
-- Year 2
('2nd Year - Theory A', 'THEORY', 2, 50),
('2nd Year - Theory B', 'THEORY', 2, 50),
('2nd Year - Lab 1',    'LAB',    2, 25),
('2nd Year - Lab 2',    'LAB',    2, 25),
('2nd Year - Lab 3',    'LAB',    2, 25),
('2nd Year - Lab 4',    'LAB',    2, 25),
-- Year 3
('3rd Year - Theory A', 'THEORY', 3, 50),
('3rd Year - Theory B', 'THEORY', 3, 50),
('3rd Year - Lab 1',    'LAB',    3, 25),
('3rd Year - Lab 2',    'LAB',    3, 25),
('3rd Year - Lab 3',    'LAB',    3, 25),
('3rd Year - Lab 4',    'LAB',    3, 25),
-- Year 4
('4th Year - Theory A', 'THEORY', 4, 50),
('4th Year - Theory B', 'THEORY', 4, 50),
('4th Year - Lab 1',    'LAB',    4, 25),
('4th Year - Lab 2',    'LAB',    4, 25),
('4th Year - Lab 3',    'LAB',    4, 25),
('4th Year - Lab 4',    'LAB',    4, 25);

-- ============================================================
-- 2. SEMESTERS — All 8 semesters seeded at deployment
-- Odd = 1st semester of the year, Even = 2nd semester
-- Only the CURRENT semester has is_active = TRUE
-- ============================================================
INSERT INTO semesters (name, academic_year, is_active) VALUES
('1st Year - Odd Semester',  1, TRUE),   -- currently active
('1st Year - Even Semester', 1, FALSE),
('2nd Year - Odd Semester',  2, FALSE),
('2nd Year - Even Semester', 2, FALSE),
('3rd Year - Odd Semester',  3, FALSE),
('3rd Year - Even Semester', 3, FALSE),
('4th Year - Odd Semester',  4, FALSE),
('4th Year - Even Semester', 4, FALSE);

-- ============================================================
-- 3. SUBJECTS
-- ============================================================
INSERT INTO subjects (subject_name, subject_year, subject_description, credits, semester) VALUES
('Engineering Mathematics I', 1, 'Calculus, Matrices, Series',        4, 'ODD'),
('Engineering Physics',       1, 'Mechanics, Optics, Modern Physics',  4, 'ODD'),
('Engineering Chemistry',     1, 'Organic and Inorganic Chemistry',    3, 'ODD'),
('Data Structures',           2, 'Arrays, Linked Lists, Trees, Graphs',4, 'ODD');

-- ============================================================
-- 4. STUDENTS
-- ============================================================
INSERT INTO students (name, roll_number, phone, email, dob, gender, address, parent_phone, current_year, batch_id) VALUES
('Harini',   '25CS001', '9876500001', 'harini@example.com',   '2007-05-10', 'FEMALE', '10, Main St, Trichy',       '9800000001', 1, 1),
('Kavya',    '25CS002', '9876500002', 'kavya@example.com',    '2007-08-22', 'FEMALE', '5, Gandhi Rd, Trichy',      '9800000002', 1, 1),
('Aravind',  '25CS003', '9876500003', 'aravind@example.com',  '2007-03-14', 'MALE',   '22, Lake View, Uriyur',     '9800000003', 1, 2),
('Elango',   '25CS004', '9876500004', NULL,                   '2007-11-01', 'MALE',   '7, Church Rd, Uriyur',      '9800000004', 1, 2);

-- ============================================================
-- 5. STUDENT BATCH ENROLLMENT (link students to semester)
-- ============================================================
INSERT INTO student_batch_enrollment (student_id, batch_id, semester_id) VALUES
(1, 1, 1),  -- Harini in CS A Theory, Sem 1
(2, 1, 1),  -- Kavya  in CS A Theory, Sem 1
(3, 2, 1),  -- Aravind in CS B Theory, Sem 1
(4, 2, 1);  -- Elango in CS B Theory, Sem 1

-- ============================================================
-- 6. STUDENT SUBJECT ENROLLMENT (Regular subjects — all 1st year)
-- ============================================================
INSERT INTO student_subject_enrollment (student_id, subject_id, semester_id) VALUES
(1, 1, 1), (1, 2, 1), (1, 3, 1),  -- Harini
(2, 1, 1), (2, 2, 1), (2, 3, 1),  -- Kavya
(3, 1, 1), (3, 2, 1), (3, 3, 1),  -- Aravind
(4, 1, 1), (4, 2, 1), (4, 3, 1);  -- Elango

-- ============================================================
-- 7. COLLEGE CALENDAR — Add a holiday
-- declared_by=1 is the seeded PRINCIPAL
-- ============================================================
INSERT INTO college_calendar (date, day_type, holiday_name, holiday_description, declared_by, declared_on) VALUES
('2026-04-14', 'HOLIDAY', 'Tamil New Year', 'Annual Tamil New Year Celebration', 1, '2026-03-05');

-- ============================================================
-- 8. ATTENDANCE RECORDS (sample — Slot 2 theory, today)
-- ============================================================
-- subject_id = 1 (Engineering Mathematics I) — staff picks subject at mark-time
INSERT INTO attendance_records (student_id, semester_id, subject_id, date, slot_id, status, od_reason, submitted_by, is_locked) VALUES
(1, 1, 2, CURDATE(), 2, 'PRESENT',        NULL,                  1, FALSE),
(2, 1, 2, CURDATE(), 2, 'ABSENT',         NULL,                  1, FALSE),
(3, 1, 2, CURDATE(), 2, 'OD',             'Sports Meet at REC',  1, TRUE),
(4, 1, 2, CURDATE(), 2, 'INFORMED_LEAVE', NULL,                  1, TRUE);

-- ============================================================
-- 9. ATTENDANCE AUDIT LOG (sample — Principal corrected record_id=2)
-- ============================================================
INSERT INTO attendance_audit_log (record_id, changed_by, old_status, new_status) VALUES
(2, 1, 'ABSENT', 'INFORMED_LEAVE');

-- ============================================================
-- 10. NOTIFICATION LOG (sample — SMS for Kavya's absence)
-- ============================================================
INSERT INTO notification_log (student_id, semester_id, sent_to_phone, trigger_type, trigger_date, attendance_percentage, message_sent, status) VALUES
(2, 1, '9800000002', 'PER_PERIOD', CURDATE(), 66.67, 'Your ward Kavya (25CS002) was absent for Period 2 today.', 'SENT');

-- ============================================================
-- VERIFY: Quick sanity check counts
-- ============================================================
SELECT 'users'                      AS tbl, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'batches',               COUNT(*) FROM batches
UNION ALL SELECT 'semesters',             COUNT(*) FROM semesters
UNION ALL SELECT 'subjects',              COUNT(*) FROM subjects
UNION ALL SELECT 'students',              COUNT(*) FROM students
UNION ALL SELECT 'student_batch_enroll',  COUNT(*) FROM student_batch_enrollment
UNION ALL SELECT 'student_subject_enroll',COUNT(*) FROM student_subject_enrollment
UNION ALL SELECT 'college_calendar',      COUNT(*) FROM college_calendar
UNION ALL SELECT 'attendance_records',    COUNT(*) FROM attendance_records
UNION ALL SELECT 'attendance_audit_log',  COUNT(*) FROM attendance_audit_log
UNION ALL SELECT 'notification_log',      COUNT(*) FROM notification_log;

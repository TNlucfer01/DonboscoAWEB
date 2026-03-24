USE donbosco_attendance;

-- ==========================================
-- TEST SCRIPT 1: INSERTIONS AND CONSTRAINTS
-- ==========================================

-- 1. Test Valid Insertion
-- A new Subject Staff User
INSERT INTO users (name, phone_number, role, password_hash)
VALUES ('Mrs. Kavitha', '9911223344', 'SUBJECT_STAFF', 'kavitha_hashed_pwd');

-- 2. Test UNIQUE Constraint Violation (Duplicate Phone Number)
-- This SHOULD FAIL
-- INSERT INTO users (name, phone_number, role, password_hash) VALUES ('Duplicate User', '9876543210', 'SUBJECT_STAFF', 'pwd');

-- 3. Test FOREIGN KEY Constraint Violation (Student with invalid batch_id)
-- This SHOULD FAIL because batch_id 999 does not exist
-- INSERT INTO students (name, roll_number, parent_phone, current_year, batch_id) VALUES ('Invalid Student', '24CS999', '1234567890', 1, 999);

-- 4. Test Valid Enumerable Type Insertion
-- Enrolling to a valid batch and semester but with a new record
INSERT INTO students (name, roll_number, parent_phone, current_year, batch_id)
VALUES ('Gopal', '24CS004', '9988771122', 1, 1);

-- 5. Test UNIQUE Constraint Violation in Enrollment (Same student, same batch, same sem)
-- This SHOULD FAIL
-- INSERT INTO student_batch_enrollment (student_id, batch_id, semester_id) VALUES (1, 1, 1);

-- 6. Test Valid Attendance Record Insertion
INSERT INTO attendance_records (student_id, semester_id, date, slot_id, status, submitted_by, is_locked)
VALUES ((SELECT student_id FROM students WHERE name = 'Gopal'), 1, '2026-03-05', 2, 'PRESENT', (SELECT user_id FROM users WHERE name = 'Mrs. Kavitha'), FALSE);

-- 7. Test Attendance Date + Slot UNIQUE Violation
-- This SHOULD FAIL (Student 4 already has attendance on 2026-03-05 in slot 2)
-- INSERT INTO attendance_records (student_id, semester_id, date, slot_id, status, submitted_by, is_locked) VALUES (4, 1, '2026-03-05', 2, 'ABSENT', 4, FALSE);

SELECT 'Insertion tests completed successfully.' AS Result;

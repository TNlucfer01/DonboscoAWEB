USE donbosco_attendance;

-- ==========================================
-- CRUD: students  (v4.0)
-- New fields: phone, email, dob, gender, address
-- ==========================================

-- CREATE: Add a new student
PREPARE stmt FROM 'INSERT INTO students (name, roll_number, phone, email, dob, gender, address, parent_phone, current_year, batch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
SET @name         = 'Kavya';
SET @roll_number  = '24CS007';
SET @phone        = '9876500007';
SET @email        = 'kavya@example.com';
SET @dob          = '2006-06-15';
SET @gender       = 'FEMALE';
SET @address      = '12, Main St, Uriyur';
SET @parent_phone = '9876500006';
SET @year         = 2;
SET @batch_id     = 1;
EXECUTE stmt USING @name, @roll_number, @phone, @email, @dob, @gender, @address, @parent_phone, @year, @batch_id;
DEALLOCATE PREPARE stmt;

-- READ: Get all students
SELECT student_id, name, roll_number, current_year, batch_id FROM students ORDER BY roll_number;

-- READ: Get all students from a specific year
PREPARE stmt FROM
  'SELECT s.student_id, s.name, s.roll_number, s.current_year, b.name AS batch_name
   FROM students s JOIN batches b ON s.batch_id = b.batch_id
   WHERE s.current_year = ?
   ORDER BY s.roll_number';
SET @year = 1;
EXECUTE stmt USING @year;
DEALLOCATE PREPARE stmt;

-- READ: Get a student by roll number
PREPARE stmt FROM 'SELECT * FROM students WHERE roll_number = ?';
SET @roll = '24CS001';
EXECUTE stmt USING @roll;
DEALLOCATE PREPARE stmt;

-- READ: Get all students in a specific batch
PREPARE stmt FROM 'SELECT student_id, name, roll_number FROM students WHERE batch_id = ?';
SET @batch_id = 1;
EXECUTE stmt USING @batch_id;
DEALLOCATE PREPARE stmt;

-- UPDATE: Promote students to next year (Year-end operation)
PREPARE stmt FROM 'UPDATE students SET current_year = current_year + 1 WHERE batch_id = ?';
SET @batch_id = 1;
EXECUTE stmt USING @batch_id;
DEALLOCATE PREPARE stmt;

-- UPDATE: Update a student's parent phone number
PREPARE stmt FROM 'UPDATE students SET parent_phone = ? WHERE roll_number = ?';
SET @phone = '9111222333';
SET @roll  = '24CS001';
EXECUTE stmt USING @phone, @roll;
DEALLOCATE PREPARE stmt;

-- UPDATE: Update a student's own contact details
PREPARE stmt FROM 'UPDATE students SET phone = ?, email = ? WHERE roll_number = ?';
SET @phone = '9000111222';
SET @email = 'student@example.com';
SET @roll  = '24CS001';
EXECUTE stmt USING @phone, @email, @roll;
DEALLOCATE PREPARE stmt;

-- UPDATE: Update a student's address
PREPARE stmt FROM 'UPDATE students SET address = ? WHERE roll_number = ?';
SET @address = '14, New St, Trichy';
SET @roll    = '24CS001';
EXECUTE stmt USING @address, @roll;
DEALLOCATE PREPARE stmt;

-- DELETE: Remove a student by roll number
-- NOTE: Cascades to student_batch_enrollment, student_subject_enrollment,
--        attendance_records, and notification_log.
PREPARE stmt FROM 'DELETE FROM students WHERE roll_number = ?';
SET @roll = '24CS999'; -- Replace with actual roll number
EXECUTE stmt USING @roll;
DEALLOCATE PREPARE stmt;

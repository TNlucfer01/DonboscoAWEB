USE donbosco_attendance;

-- ============================================================
-- YC: Add Student (v4.0)
-- Includes all new student fields: phone, email, dob, gender, address
-- STEP 1: Insert the student
-- ============================================================
PREPARE stmt FROM
  'INSERT INTO students (name, roll_number, phone, email, dob, gender, address, parent_phone, current_year, batch_id)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

SET @name         = 'Student Name';
SET @roll_number  = '25CS010';
SET @phone        = '9876500010';         -- student own phone (optional)
SET @email        = 'student@example.com'; -- optional
SET @dob          = '2007-06-01';          -- optional
SET @gender       = 'MALE';               -- MALE | FEMALE | OTHER
SET @address      = '5, Main St, Trichy'; -- optional
SET @parent_phone = '9800000010';          -- REQUIRED
SET @current_year = 1;
SET @batch_id     = 1;                    -- must be a valid batch_id for current_year

EXECUTE stmt USING @name, @roll_number, @phone, @email, @dob, @gender, @address, @parent_phone, @current_year, @batch_id;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- STEP 2: Enroll in batch for current semester
-- Run immediately after adding the student
-- ============================================================
PREPARE stmt FROM
  'INSERT INTO student_batch_enrollment (student_id, batch_id, semester_id)
   VALUES (LAST_INSERT_ID(), ?, ?)';

SET @batch_id    = 1;
SET @semester_id = 1;  -- current active semester
EXECUTE stmt USING @batch_id, @semester_id;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- STEP 3: Enroll in all regular subjects for their year+semester
-- Run after batch enrollment (loops are done in application layer)
-- This is the single-subject version of the enrollment INSERT:
-- ============================================================
PREPARE stmt FROM
  'INSERT INTO student_subject_enrollment (student_id, subject_id, semester_id)
   SELECT s.student_id, sub.subject_id, ?
   FROM students s
   JOIN subjects sub ON sub.subject_year = s.current_year AND sub.semester = ?
   WHERE s.roll_number = ?
     AND NOT EXISTS (
       SELECT 1 FROM student_subject_enrollment sse
       WHERE sse.student_id = s.student_id
         AND sse.subject_id = sub.subject_id
         AND sse.semester_id = ?
     )';

SET @semester_id   = 1;
SET @semester_type = 'Odd';   -- 'Odd' or 'Even' — matches subjects.semester
SET @roll_number   = '25CS010';
EXECUTE stmt USING @semester_id, @semester_type, @roll_number, @semester_id;
DEALLOCATE PREPARE stmt;

USE donbosco_attendance;

-- ==========================================
-- CRUD: student_batch_enrollment
-- Tracks which batch a student belongs to per semester.
-- UNIQUE(student_id, batch_id, semester_id) prevents duplicate enrollment.
-- ==========================================

-- CREATE: Enroll a student in a batch for a semester
PREPARE stmt FROM 'INSERT INTO student_batch_enrollment (student_id, batch_id, semester_id) VALUES (?, ?, ?)';
SET @student_id  = 1;
SET @batch_id    = 1;
SET @semester_id = 1;
EXECUTE stmt USING @student_id, @batch_id, @semester_id;
DEALLOCATE PREPARE stmt;

-- READ: Get all enrollments for a batch in a semester
PREPARE stmt FROM
  'SELECT s.roll_number, s.name, b.name AS batch, sem.name AS semester
   FROM student_batch_enrollment sbe
   JOIN students s   ON sbe.student_id = s.student_id
   JOIN batches b    ON sbe.batch_id = b.batch_id
   JOIN semesters sem ON sbe.semester_id = sem.semester_id
   WHERE sbe.batch_id = ? AND sbe.semester_id = ?';
SET @batch_id    = 1;
SET @semester_id = 1;
EXECUTE stmt USING @batch_id, @semester_id;
DEALLOCATE PREPARE stmt;

-- READ: Find all batches a student is enrolled in
PREPARE stmt FROM
  'SELECT b.name AS batch_name, sem.name AS semester
   FROM student_batch_enrollment sbe
   JOIN batches b     ON sbe.batch_id = b.batch_id
   JOIN semesters sem ON sbe.semester_id = sem.semester_id
   WHERE sbe.student_id = ?';
SET @student_id = 1;
EXECUTE stmt USING @student_id;
DEALLOCATE PREPARE stmt;

-- UPDATE: Move student to a different batch in the same semester
PREPARE stmt FROM 'UPDATE student_batch_enrollment SET batch_id = ? WHERE student_id = ? AND semester_id = ?';
SET @new_batch_id = 1; -- NOTE: batch_id=2 would fail if only one batch exists; adjust to a valid batch_id
SET @student_id   = 1;
SET @semester_id  = 1;
EXECUTE stmt USING @new_batch_id, @student_id, @semester_id;
DEALLOCATE PREPARE stmt;

-- DELETE: Remove a student's batch enrollment (e.g., if student withdraws)
PREPARE stmt FROM 'DELETE FROM student_batch_enrollment WHERE student_id = ? AND semester_id = ?';
SET @student_id  = 99;
SET @semester_id = 99;
EXECUTE stmt USING @student_id, @semester_id;
DEALLOCATE PREPARE stmt;

USE donbosco_attendance;

-- ==========================================
-- CRUD: student_subject_enrollment
-- Tracks which subjects a student is enrolled in per semester.
-- UNIQUE(student_id, subject_id, semester_id) prevents duplicate enrollment.
-- ==========================================

-- CREATE: Enroll a student in a subject for a semester
PREPARE stmt FROM 'INSERT INTO student_subject_enrollment (student_id, subject_id, semester_id) VALUES (?, ?, ?)';
SET @student_id  = 1;
SET @subject_id  = 1;
SET @semester_id = 1;
EXECUTE stmt USING @student_id, @subject_id, @semester_id;
DEALLOCATE PREPARE stmt;

-- READ: Get all subjects a specific student is enrolled in this semester
PREPARE stmt FROM
  'SELECT sub.subject_name, sub.credits, sub.semester, sem.name AS semester_name
   FROM student_subject_enrollment sse
   JOIN subjects sub  ON sse.subject_id = sub.subject_id
   JOIN semesters sem ON sse.semester_id = sem.semester_id
   WHERE sse.student_id = ? AND sse.semester_id = ?';
SET @student_id  = 1;
SET @semester_id = 1;
EXECUTE stmt USING @student_id, @semester_id;
DEALLOCATE PREPARE stmt;

-- READ: Get all students enrolled in a specific subject
PREPARE stmt FROM
  'SELECT s.roll_number, s.name
   FROM student_subject_enrollment sse
   JOIN students s ON sse.student_id = s.student_id
   WHERE sse.subject_id = ? AND sse.semester_id = ?';
SET @subject_id  = 1;
SET @semester_id = 1;
EXECUTE stmt USING @subject_id, @semester_id;
DEALLOCATE PREPARE stmt;

-- UPDATE: Re-enroll student in a different subject (swap with new subject_id)
-- NOTE: @new_subject_id must be a valid subject that exists. Use a real subject_id from DB.
PREPARE stmt FROM 'UPDATE student_subject_enrollment SET subject_id = ? WHERE student_id = ? AND subject_id = ? AND semester_id = ?';
SET @new_subject_id = 1; -- keep same subject as example; swap to another valid id in production
SET @student_id     = 1;
SET @old_subject_id = 1;
SET @semester_id    = 1;
EXECUTE stmt USING @new_subject_id, @student_id, @old_subject_id, @semester_id;
DEALLOCATE PREPARE stmt;

-- DELETE: Remove a student's subject enrollment
PREPARE stmt FROM 'DELETE FROM student_subject_enrollment WHERE student_id = ? AND subject_id = ? AND semester_id = ?';
SET @student_id  = 99;
SET @subject_id  = 99;
SET @semester_id = 99;
EXECUTE stmt USING @student_id, @subject_id, @semester_id;
DEALLOCATE PREPARE stmt;

USE donbosco_attendance;

-- Q2.2: Map Student to Semester/Batch (enrollment)
-- 1. Prepare the statement with placeholders
PREPARE stmt FROM 'INSERT INTO student_batch_enrollment (student_id, batch_id, semester_id) VALUES (?, ?, ?)';

-- 2. Execute the statement, binding actual values
SET @student_id = 1;
SET @batch_id = 1;
SET @semester_id = 1;
EXECUTE stmt USING @student_id, @batch_id, @semester_id;

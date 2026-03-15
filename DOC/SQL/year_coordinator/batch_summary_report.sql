USE donbosco_attendance;

-- Q2.5: Report - Batch Summary View
-- 1. Prepare the statement with placeholders
PREPARE stmt FROM '
SELECT b.name as batch_name, COUNT(s.student_id) as total_students
FROM batches b
LEFT JOIN students s ON b.batch_id = s.batch_id
WHERE b.year = ? -- The YC''s year
GROUP BY b.batch_id;
';

-- 2. Execute the statement, binding actual values
SET @year = 1;
EXECUTE stmt USING @year;

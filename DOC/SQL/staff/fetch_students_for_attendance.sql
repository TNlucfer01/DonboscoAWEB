USE donbosco_attendance;

-- Q1.1: Fetch all students in a specific batch (Year -> Batch -> Period flow)
-- Used when the Staff clicks "Fetch Students"
-- 1. Prepare the statement with placeholders
PREPARE stmt FROM '
SELECT s.student_id, s.roll_number, s.name, 
       COALESCE(ar.status, ''NOT_MARKED'') as current_status,
       ar.is_locked, ar.od_reason
FROM students s
-- Join enrollment to verify they belong to the batch for this semester
INNER JOIN student_batch_enrollment sbe ON s.student_id = sbe.student_id
-- Left join attendance to see if there''s already a locked row (OD/IL) for today
LEFT JOIN attendance_records ar ON s.student_id = ar.student_id 
    AND ar.date = ? 
    AND ar.slot_id = ?
WHERE sbe.batch_id = ?
  AND sbe.semester_id = ?
ORDER BY s.roll_number;
';

-- 2. Execute the statement, binding actual values
SET @date = CURDATE();
SET @slot_id = 1;
SET @batch_id = 1;
SET @semester_id = 1;
EXECUTE stmt USING @date, @slot_id, @batch_id, @semester_id;

USE donbosco_attendance;

-- Q1.2: Submit Attendance (Insert new record)
-- Executed per student marked Present or Absent
-- 1. Prepare the statement with placeholders
PREPARE stmt FROM '
INSERT INTO attendance_records (student_id, semester_id, date, slot_id, status, submitted_by, submitted_at, is_locked)
VALUES (?, ?, ?, ?, ?, ?, NOW(), FALSE)
ON DUPLICATE KEY UPDATE status = VALUES(status), submitted_by = VALUES(submitted_by), submitted_at = NOW();
';

-- 2. Execute the statement, binding actual values
SET @student_id = 1;
SET @semester_id = 1;
SET @date = CURDATE();
SET @slot_id = 1;
SET @status = 'PRESENT';
SET @submitted_by = 1; -- Example user_id
EXECUTE stmt USING @student_id, @semester_id, @date, @slot_id, @status, @submitted_by;

USE donbosco_attendance;

-- Q3.4: Log the Correction in Audit Log (Always run right after correct_attendance.sql)
-- 1. Prepare the statement with placeholders (?)
PREPARE stmt FROM 'INSERT INTO attendance_audit_log (record_id, changed_by, old_status, new_status, changed_at) VALUES (?, ?, ?, ?, ?)';

-- 2. Execute the statement, binding actual values to the placeholders
SET @record_id = 1;
SET @changed_by = 1; -- Assuming user_id 1
SET @old_status = 'PRESENT';
SET @new_status = 'ABSENT';
SET @changed_at = NOW();
EXECUTE stmt USING @record_id, @changed_by, @old_status, @new_status, @changed_at;

USE donbosco_attendance;

-- Q2.4: Pre-enter Informed Leave (Future Date Only)
-- 1. Prepare the statement with placeholders
PREPARE stmt FROM '
INSERT INTO attendance_records (student_id, semester_id, date, slot_id, status, submitted_by, is_locked)
VALUES (?, ?, ?, ?, ?, ?, TRUE)
';

-- 2. Execute the statement, binding actual values
SET @student_id = 1;
SET @semester_id = 1;
SET @date = '2026-04-02';
SET @slot_id = 1;
SET @status = 'INFORMED_LEAVE';
SET @submitted_by = 1; -- Assuming user_id
EXECUTE stmt USING @student_id, @semester_id, @date, @slot_id, @status, @submitted_by;

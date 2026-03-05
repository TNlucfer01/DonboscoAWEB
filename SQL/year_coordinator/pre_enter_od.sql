USE donbosco_attendance;

-- Q2.3: Pre-enter OD (Future Date Only)
-- 1. Prepare the statement with placeholders
PREPARE stmt FROM '
INSERT INTO attendance_records (student_id, semester_id, date, slot_id, status, od_reason, submitted_by, is_locked)
VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
';

-- 2. Execute the statement, binding actual values
SET @student_id = 1;
SET @semester_id = 1;
SET @date = '2026-04-03';
SET @slot_id = 1;
SET @status = 'OD';
SET @od_reason = 'testing_od';
SET @submitted_by = 1; -- Assuming user_id
EXECUTE stmt USING @student_id, @semester_id, @date, @slot_id, @status, @od_reason, @submitted_by;

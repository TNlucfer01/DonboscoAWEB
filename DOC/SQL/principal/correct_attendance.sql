USE donbosco_attendance;

-- Q3.3: Correct Attendance Record (Change ANY student's status on past/future date)
-- 1. Prepare the statement with placeholders (?)
PREPARE stmt FROM 'UPDATE attendance_records SET status = ?, od_reason = ? WHERE student_id = ? AND date = ? AND slot_id = ?';

-- 2. Execute the statement, binding actual values to the placeholders
SET @status = 'PRESENT';
SET @od_reason = 'nothing_testing';
SET @student_id = 1;
SET @date = '2023-04-02';
SET @slot_id = 1;
EXECUTE stmt USING @status, @od_reason, @student_id, @date, @slot_id;
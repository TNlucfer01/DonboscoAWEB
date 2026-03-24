USE donbosco_attendance;

-- Q2.6: Year-level Attendance Report (% calculation for a semester)
-- Count Present + OD, divide by Total working periods (excluding holidays)
-- 1. Prepare the statement with placeholders
PREPARE stmt FROM '
SELECT s.student_id, s.name, s.roll_number,
       SUM(CASE WHEN ar.status IN (''PRESENT'', ''OD'') THEN 1 ELSE 0 END) as total_attended,
       COUNT(ts.slot_id) as student_total_slots,
       -- simplified percentage logic (excludes calendar logic for briefness)
       ROUND((SUM(CASE WHEN ar.status IN (''PRESENT'', ''OD'') THEN 1 ELSE 0 END) / COUNT(ar.record_id)) * 100, 2) as attendance_percentage
FROM students s
INNER JOIN attendance_records ar ON s.student_id = ar.student_id
INNER JOIN timetable_slots ts ON ar.slot_id = ts.slot_id
WHERE s.current_year = ? AND ar.semester_id = ?
GROUP BY s.student_id;
';

-- 2. Execute the statement, binding actual values
SET @current_year = 1;
SET @semester_id = 1;
EXECUTE stmt USING @current_year, @semester_id;

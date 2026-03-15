USE donbosco_attendance;

-- Query to get all students from a particular year (e.g., Year 1)
-- Replace the '1' with 2, 3, or 4 for other years.
SELECT student_id, name, roll_number, parent_phone, batch_id, current_year 
FROM students 
WHERE current_year = 1
ORDER BY roll_number;

-- If you also want to see their batch name alongside:
SELECT s.student_id, s.name, s.roll_number, s.current_year, b.name AS batch_name
FROM students s
JOIN batches b ON s.batch_id = b.batch_id
WHERE s.current_year = 1
ORDER BY s.roll_number;

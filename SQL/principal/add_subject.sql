USE donbosco_attendance;

-- Q3.1: Add Subject
-- 1. Prepare the statement with placeholders (?)
PREPARE stmt FROM 'INSERT INTO subjects (subject_name, subject_year, subject_description, credits, semester) VALUES (?, ?, ?, ?, ?)';

-- 2. Execute the statement, binding actual values to the placeholders
SET @subject_name = 'testing';
SET @subject_year = 2;
SET @subject_description = 'nothing_testing';
SET @credits = 3;
SET @semester = 'Odd';
EXECUTE stmt USING @subject_name, @subject_year, @subject_description, @credits, @semester;

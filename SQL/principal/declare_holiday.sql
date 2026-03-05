USE donbosco_attendance;

-- Q3.2: Mark College Holiday
-- 1. Prepare the statement with placeholders (?)
PREPARE stmt FROM 'INSERT INTO college_calendar (date, day_type, holiday_name, holiday_description, declared_by, declared_on) VALUES (?, ?, ?, ?, ?, ?)';

-- 2. Execute the statement, binding actual values to the placeholders
SET @date = '2023-02-02';
SET @day_type = 'HOLIDAY';
SET @holiday_name = 'nothing';
SET @holiday_description = 'testing';
SET @declared_by = 1; -- assuming user_id 1
SET @declared_on = CURDATE();
EXECUTE stmt USING @date, @day_type, @holiday_name, @holiday_description, @declared_by, @declared_on;
USE donbosco_attendance;

-- ==========================================
-- CRUD: college_calendar
-- Only the PRINCIPAL (a user) can declare calendar entries.
-- ==========================================

-- CREATE: Declare a holiday or working day
-- NOTE: date must be UNIQUE — cannot insert the same date twice.
PREPARE stmt FROM 'INSERT INTO college_calendar (date, day_type, holiday_name, holiday_description, declared_by, declared_on) VALUES (?, ?, ?, ?, ?, ?)';
SET @date        = '2026-04-14';
SET @day_type    = 'HOLIDAY'; -- WORKING | HOLIDAY | SATURDAY_ENABLED
SET @hname       = 'Tamil New Year';
SET @hdesc       = 'Annual Tamil New Year Celebration';
SET @declared_by = 1; -- MUST be a valid PRINCIPAL user_id (user_id=1 is the seeded Principal)
                      -- NOTE: Non-Principal users attempting this will get a FK constraint error (by design)
SET @declared_on = '2026-03-01';
EXECUTE stmt USING @date, @day_type, @hname, @hdesc, @declared_by, @declared_on;
DEALLOCATE PREPARE stmt;

-- READ: View entire calendar
SELECT date, day_type, holiday_name, declared_on FROM college_calendar ORDER BY date;

-- READ: View only holidays
PREPARE stmt FROM 'SELECT date, holiday_name, holiday_description FROM college_calendar WHERE day_type = ?';
SET @day_type = 'HOLIDAY';
EXECUTE stmt USING @day_type;
DEALLOCATE PREPARE stmt;

-- READ: Check if a specific date is a working day
PREPARE stmt FROM 'SELECT date, day_type FROM college_calendar WHERE date = ?';
SET @date = '2026-03-05';
EXECUTE stmt USING @date;
DEALLOCATE PREPARE stmt;

-- UPDATE: Change the type of a declared date (e.g., reclassify)
PREPARE stmt FROM 'UPDATE college_calendar SET day_type = ?, holiday_name = ? WHERE date = ?';
SET @new_type = 'SATURDAY_ENABLED';
SET @new_name = 'Compensatory Working Day';
SET @date     = '2026-04-14';
EXECUTE stmt USING @new_type, @new_name, @date;
DEALLOCATE PREPARE stmt;

-- DELETE: Remove a calendar entry
PREPARE stmt FROM 'DELETE FROM college_calendar WHERE date = ?';
SET @date = '2026-04-14';
EXECUTE stmt USING @date;
DEALLOCATE PREPARE stmt;

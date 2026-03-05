USE donbosco_attendance;

-- ==========================================
-- CRUD: timetable_slots
-- ==========================================

-- CREATE: Add a new timetable slot
-- NOTE: Default slots 1-5 are seeded in schema. Only add if the college adds new periods.
PREPARE stmt FROM 'INSERT INTO timetable_slots (slot_number, start_time, end_time, slot_type) VALUES (?, ?, ?, ?)';
SET @slot_number = 6;
SET @start_time  = '17:30:00';
SET @end_time    = '18:30:00';
SET @slot_type   = 'THEORY'; -- THEORY | LAB
EXECUTE stmt USING @slot_number, @start_time, @end_time, @slot_type;
DEALLOCATE PREPARE stmt;

-- READ: Get all slots
SELECT slot_id, slot_number, start_time, end_time, slot_type FROM timetable_slots ORDER BY slot_number;

-- READ: Get all THEORY slots
PREPARE stmt FROM 'SELECT slot_id, slot_number, start_time, end_time FROM timetable_slots WHERE slot_type = ?';
SET @slot_type = 'THEORY';
EXECUTE stmt USING @slot_type;
DEALLOCATE PREPARE stmt;

-- UPDATE: Modify slot time
-- NOTE: Commented out to prevent overwriting schema-seeded slot times during testing.
--       Only uncomment if the college genuinely changes the daily schedule.
-- PREPARE stmt FROM 'UPDATE timetable_slots SET start_time = ?, end_time = ? WHERE slot_id = ?';
-- SET @start = '10:30:00';
-- SET @end   = '11:30:00';
-- SET @id    = 2;
-- EXECUTE stmt USING @start, @end, @id;
-- DEALLOCATE PREPARE stmt;

-- DELETE: Remove a slot
-- WARN: Will fail if attendance records reference this slot (ON DELETE RESTRICT).
PREPARE stmt FROM 'DELETE FROM timetable_slots WHERE slot_id = ?';
SET @id = 6;
EXECUTE stmt USING @id;
DEALLOCATE PREPARE stmt;

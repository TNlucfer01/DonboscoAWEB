USE donbosco_attendance;

-- Q4.1: Find Uninformed Leave for Immediate SMS
-- Finds all "unlocked" ABSENT records for a specific date (typically CURDATE()) that haven't been picked up yet
-- 1. Prepare the statement with placeholders
PREPARE stmt FROM '
SELECT ar.record_id, s.name, s.roll_number, s.parent_phone, ts.slot_number, ar.date
FROM attendance_records ar
INNER JOIN students s ON ar.student_id = s.student_id
INNER JOIN timetable_slots ts ON ar.slot_id = ts.slot_id
WHERE ar.date = ?
  AND ar.status = ?
  AND ar.is_locked = FALSE
  -- Left join notification_log to ensure we don''t send duplicates
  AND NOT EXISTS (
      SELECT 1 FROM notification_log nl 
      WHERE nl.student_id = ar.student_id AND nl.trigger_date = ar.date 
      AND nl.trigger_type = ?
  );
';

-- 2. Execute the statement, binding actual values
SET @date = CURDATE();
SET @status = 'ABSENT';
SET @trigger = 'PER_PERIOD';
EXECUTE stmt USING @date, @status, @trigger;

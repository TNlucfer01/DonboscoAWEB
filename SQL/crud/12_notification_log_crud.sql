USE donbosco_attendance;

-- ==========================================
-- CRUD: notification_log
-- Logs every SMS notification sent to a parent.
-- No UPDATE — logs are immutable once sent.
-- ==========================================

-- CREATE: Log a notification that was sent to a parent
PREPARE stmt FROM
  'INSERT INTO notification_log (student_id, semester_id, trigger_type, trigger_date, attendance_percentage, message_sent, status)
   VALUES (?, ?, ?, ?, ?, ?, ?)';
SET @student_id   = 1;  -- valid student_id (seed: Kavya = 1)
SET @semester_id  = 1;
SET @trigger_type = 'PER_PERIOD'; -- PER_PERIOD | MONTHLY_SUMMARY
SET @trigger_date = CURDATE();
SET @percentage   = 45.00;
SET @message      = 'Your ward Elango was absent for Period 2 on 04-03-2026.';
SET @status       = 'SENT'; -- SENT | FAILED
EXECUTE stmt USING @student_id, @semester_id, @trigger_type, @trigger_date, @percentage, @message, @status;
DEALLOCATE PREPARE stmt;

-- READ: View all notifications sent to parents today
PREPARE stmt FROM
  'SELECT s.roll_number, s.name AS student_name, s.parent_phone, nl.message_sent, nl.status
   FROM notification_log nl
   JOIN students s ON nl.student_id = s.student_id
   WHERE nl.trigger_date = ?';
SET @date = CURDATE();
EXECUTE stmt USING @date;
DEALLOCATE PREPARE stmt;

-- READ: View failed notifications (for retry)
PREPARE stmt FROM
  'SELECT nl.log_id, s.roll_number, s.name, s.parent_phone, nl.message_sent, nl.trigger_date
   FROM notification_log nl
   JOIN students s ON nl.student_id = s.student_id
   WHERE nl.status = ?';
SET @status = 'FAILED';
EXECUTE stmt USING @status;
DEALLOCATE PREPARE stmt;

-- READ: Get all notifications for a student in a semester
PREPARE stmt FROM
  'SELECT nl.trigger_date, nl.trigger_type, nl.attendance_percentage, nl.message_sent, nl.status
   FROM notification_log nl
   WHERE nl.student_id = ? AND nl.semester_id = ?
   ORDER BY nl.trigger_date DESC';
SET @student_id  = 1;
SET @semester_id = 1;
EXECUTE stmt USING @student_id, @semester_id;
DEALLOCATE PREPARE stmt;

-- DELETE: Purge old notification logs (e.g., for archiving past semester data)
PREPARE stmt FROM 'DELETE FROM notification_log WHERE semester_id = ?';
SET @semester_id = 99; -- Replace with actual semester to clear
EXECUTE stmt USING @semester_id;
DEALLOCATE PREPARE stmt;

-- NOTE: No UPDATE — a notification once sent is permanent. If it failed, create a new entry.

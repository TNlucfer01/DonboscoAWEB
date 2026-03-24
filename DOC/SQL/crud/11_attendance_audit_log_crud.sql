USE donbosco_attendance;

-- ==========================================
-- CRUD: attendance_audit_log
-- Created whenever the PRINCIPAL manually changes an attendance record.
-- No UPDATE or DELETE — audit logs are immutable by design.
-- ==========================================

-- CREATE: Log a change made by Principal
PREPARE stmt FROM
  'INSERT INTO attendance_audit_log (record_id, changed_by, old_status, new_status)
   VALUES (?, ?, ?, ?)';
SET @record_id  = 2;
SET @changed_by = 1; -- Must be a valid PRINCIPAL user_id
SET @old_status = 'ABSENT';
SET @new_status = 'OD';
EXECUTE stmt USING @record_id, @changed_by, @old_status, @new_status;
DEALLOCATE PREPARE stmt;

-- READ: View full audit log with student and change details
SELECT
  aal.changed_at,
  s.roll_number,
  s.name AS student_name,
  ar.date AS attendance_date,
  ts.start_time AS period_start,
  aal.old_status,
  aal.new_status,
  u.name AS changed_by_principal
FROM attendance_audit_log aal
JOIN attendance_records ar ON aal.record_id = ar.record_id
JOIN students s ON ar.student_id = s.student_id
JOIN timetable_slots ts ON ar.slot_id = ts.slot_id
JOIN users u ON aal.changed_by = u.user_id
ORDER BY aal.changed_at DESC;

-- READ: Get audit log for a particular student
PREPARE stmt FROM
  'SELECT aal.changed_at, ar.date, aal.old_status, aal.new_status, u.name AS principal_name
   FROM attendance_audit_log aal
   JOIN attendance_records ar ON aal.record_id = ar.record_id
   JOIN users u ON aal.changed_by = u.user_id
   WHERE ar.student_id = ?
   ORDER BY aal.changed_at DESC';
SET @student_id = 1;
EXECUTE stmt USING @student_id;
DEALLOCATE PREPARE stmt;

-- READ: Get audit log for a specific date
PREPARE stmt FROM
  'SELECT s.roll_number, s.name, aal.old_status, aal.new_status, u.name AS changed_by
   FROM attendance_audit_log aal
   JOIN attendance_records ar ON aal.record_id = ar.record_id
   JOIN students s ON ar.student_id = s.student_id
   JOIN users u ON aal.changed_by = u.user_id
   WHERE ar.date = ?';
SET @date = '2026-03-05';
EXECUTE stmt USING @date;
DEALLOCATE PREPARE stmt;

-- NOTE: No UPDATE or DELETE operations.
-- Audit logs must remain permanent and tamper-proof.

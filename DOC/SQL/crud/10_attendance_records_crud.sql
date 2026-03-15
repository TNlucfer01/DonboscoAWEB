USE donbosco_attendance;

-- ==========================================
-- CRUD: attendance_records
-- UNIQUE(student_id, date, slot_id) prevents double-marking.
-- Only SUBJECT_STAFF can submit; PRINCIPAL can lock/correct records.
-- ==========================================

-- CREATE: Submit attendance for a student in a period
PREPARE stmt FROM
  'INSERT INTO attendance_records (student_id, semester_id, date, slot_id, status, od_reason, submitted_by, is_locked)
   VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)';
SET @student_id   = 1;  -- valid student_id (seed: Kavya = 1)
SET @semester_id  = 1;
SET @date         = CURDATE();
SET @slot_id      = 2;
SET @status       = 'PRESENT'; -- PRESENT | ABSENT | OD | INFORMED_LEAVE
SET @od_reason    = NULL;
SET @submitted_by = 1;  -- valid user_id; must be a SUBJECT_STAFF or PRINCIPAL
EXECUTE stmt USING @student_id, @semester_id, @date, @slot_id, @status, @od_reason, @submitted_by;
DEALLOCATE PREPARE stmt;

-- READ: View all attendance records for a student on a specific date
PREPARE stmt FROM
  'SELECT ts.start_time, ts.end_time, ar.status, ar.od_reason, u.name AS marked_by
   FROM attendance_records ar
   JOIN timetable_slots ts ON ar.slot_id = ts.slot_id
   JOIN users u ON ar.submitted_by = u.user_id
   WHERE ar.student_id = ? AND ar.date = ?';
SET @student_id = 1;
SET @date       = '2026-03-05';
EXECUTE stmt USING @student_id, @date;
DEALLOCATE PREPARE stmt;



-- READ: View full attendance sheet for a batch on a date (Staff View)
PREPARE stmt FROM
  'SELECT s.roll_number, s.name, ar.status, ts.start_time
   FROM attendance_records ar
   JOIN students s ON ar.student_id = s.student_id
   JOIN timetable_slots ts ON ar.slot_id = ts.slot_id
   WHERE s.batch_id = ? AND ar.date = ?
   ORDER BY ts.start_time, s.roll_number';
SET @batch_id = 1;
SET @date     = '2026-03-05';
EXECUTE stmt USING @batch_id, @date;
DEALLOCATE PREPARE stmt;

-- READ: Attendance percentage for a student in a semester
PREPARE stmt FROM
  'SELECT
     s.name, s.roll_number,
     COUNT(*) AS total_periods,
     SUM(CASE WHEN ar.status IN (''PRESENT'', ''OD'', ''INFORMED_LEAVE'') THEN 1 ELSE 0 END) AS attended,
     ROUND(SUM(CASE WHEN ar.status IN (''PRESENT'', ''OD'', ''INFORMED_LEAVE'') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS attendance_pct
   FROM attendance_records ar
   JOIN students s ON ar.student_id = s.student_id
   WHERE ar.student_id = ? AND ar.semester_id = ?
   GROUP BY s.name, s.roll_number';
SET @student_id  = 1;
SET @semester_id = 1;
EXECUTE stmt USING @student_id, @semester_id;
DEALLOCATE PREPARE stmt;

-- UPDATE: Correct an attendance status (Principal action — also logs to audit table)
PREPARE stmt FROM 'UPDATE attendance_records SET status = ?, is_locked = TRUE WHERE record_id = ?';
SET @new_status = 'OD';
SET @record_id  = 2;
EXECUTE stmt USING @new_status, @record_id;
DEALLOCATE PREPARE stmt;

-- UPDATE: Lock a day's attendance (prevents further edits)
PREPARE stmt FROM 'UPDATE attendance_records SET is_locked = TRUE WHERE date = ?';
SET @date = '2026-03-05';
EXECUTE stmt USING @date;
DEALLOCATE PREPARE stmt;

-- DELETE: Remove an incorrect attendance record (only if not locked)
PREPARE stmt FROM 'DELETE FROM attendance_records WHERE record_id = ? AND is_locked = FALSE';
SET @record_id = 99;
EXECUTE stmt USING @record_id;
DEALLOCATE PREPARE stmt;

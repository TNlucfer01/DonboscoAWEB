USE donbosco_attendance;

-- ============================================================
-- YC: Attendance View — By Calendar Date × Period (Slot)
-- Shows who was present/absent/OD/IL on a specific date and slot
-- Inputs: @date, @slot_id, @semester_id, @academic_year
-- ============================================================
PREPARE stmt FROM '
SELECT
    s.roll_number,
    s.name               AS student_name,
    b.name               AS batch,
    ts.slot_number        AS period,
    ts.start_time,
    ts.end_time,
    COALESCE(ar.status, ''NOT MARKED'') AS status,
    ar.od_reason,
    ar.is_locked,
    u.name               AS marked_by
FROM students s
JOIN batches b             ON s.batch_id      = b.batch_id
JOIN timetable_slots ts    ON ts.slot_id       = ?
LEFT JOIN attendance_records ar
    ON ar.student_id   = s.student_id
   AND ar.date         = ?
   AND ar.slot_id      = ts.slot_id
   AND ar.semester_id  = ?
LEFT JOIN users u          ON ar.submitted_by  = u.user_id
WHERE s.current_year       = ?
ORDER BY b.name, s.roll_number
';
SET @slot_id      = 2;
SET @date         = CURDATE();
SET @semester_id  = 1;
SET @academic_year = 1;
EXECUTE stmt USING @slot_id, @date, @semester_id, @academic_year;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- HELPER: Get all working dates that have attendance records
-- Useful for populating the calendar UI with clickable dates
-- Input: @semester_id, @academic_year
-- ============================================================
PREPARE stmt FROM '
SELECT DISTINCT
    ar.date,
    cc.day_type
FROM attendance_records ar
JOIN students s    ON ar.student_id  = s.student_id
LEFT JOIN college_calendar cc ON cc.date = ar.date
WHERE ar.semester_id = ?
  AND s.current_year = ?
ORDER BY ar.date DESC
';
SET @semester_id   = 1;
SET @academic_year = 1;
EXECUTE stmt USING @semester_id, @academic_year;
DEALLOCATE PREPARE stmt;

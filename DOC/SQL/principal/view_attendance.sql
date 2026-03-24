USE donbosco_attendance;

-- ============================================================
-- Principal: Attendance Multi-View Queries
-- Flexible — filter by any combination of subject, year, semester, roll number
-- All queries return: student name, roll number, attendance %
-- ============================================================

-- ============================================================
-- VIEW 1: By Subject
-- Shows all students enrolled in a subject + their attendance %
-- Inputs: @subject_id, @semester_id
-- ============================================================
PREPARE stmt FROM '
SELECT
    s.roll_number,
    s.name              AS student_name,
    b.name              AS batch,
    b.year              AS academic_year,
    sub.subject_name,
    semi.name           AS semester,
    COUNT(ar.record_id) AS total_periods,
    SUM(CASE WHEN ar.status IN (''PRESENT'', ''OD'') THEN 1 ELSE 0 END) AS attended,
    ROUND(
        SUM(CASE WHEN ar.status IN (''PRESENT'', ''OD'') THEN 1 ELSE 0 END) * 100.0
        / NULLIF(COUNT(ar.record_id), 0),
    2) AS attendance_pct
FROM student_subject_enrollment sse
JOIN students s          ON sse.student_id  = s.student_id
JOIN subjects sub        ON sse.subject_id  = sub.subject_id
JOIN semesters semi      ON sse.semester_id = semi.semester_id
JOIN batches b           ON s.batch_id      = b.batch_id
LEFT JOIN attendance_records ar
    ON ar.student_id  = s.student_id
   AND ar.semester_id = sse.semester_id
WHERE sse.subject_id  = ?
  AND sse.semester_id = ?
GROUP BY s.student_id, sub.subject_id
ORDER BY b.year, s.roll_number
';
SET @subject_id  = 1;
SET @semester_id = 1;
EXECUTE stmt USING @subject_id, @semester_id;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- VIEW 2: By Academic Year + Semester (all students in a year)
-- Inputs: @academic_year, @semester_id
-- ============================================================
PREPARE stmt FROM '
SELECT
    s.roll_number,
    s.name          AS student_name,
    b.name          AS batch,
    semi.name       AS semester,
    COUNT(ar.record_id) AS total_periods,
    SUM(CASE WHEN ar.status IN (''PRESENT'', ''OD'') THEN 1 ELSE 0 END) AS attended,
    ROUND(
        SUM(CASE WHEN ar.status IN (''PRESENT'', ''OD'') THEN 1 ELSE 0 END) * 100.0
        / NULLIF(COUNT(ar.record_id), 0),
    2) AS attendance_pct
FROM students s
JOIN batches b          ON s.batch_id      = b.batch_id
JOIN semesters semi     ON semi.semester_id = ?
LEFT JOIN attendance_records ar
    ON ar.student_id  = s.student_id
   AND ar.semester_id = semi.semester_id
WHERE s.current_year = ?
GROUP BY s.student_id
ORDER BY attendance_pct ASC
';
SET @semester_id   = 1;
SET @academic_year = 1;
EXECUTE stmt USING @semester_id, @academic_year;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- VIEW 3: By Roll Number (single student full breakdown)
-- Inputs: @roll_number, @semester_id
-- ============================================================
PREPARE stmt FROM '
SELECT
    s.roll_number,
    s.name              AS student_name,
    s.phone,
    s.parent_phone,
    sub.subject_name,
    COUNT(ar.record_id) AS total_periods,
    SUM(CASE WHEN ar.status IN (''PRESENT'', ''OD'') THEN 1 ELSE 0 END) AS attended,
    ROUND(
        SUM(CASE WHEN ar.status IN (''PRESENT'', ''OD'') THEN 1 ELSE 0 END) * 100.0
        / NULLIF(COUNT(ar.record_id), 0),
    2) AS attendance_pct
FROM students s
JOIN student_subject_enrollment sse ON s.student_id  = sse.student_id
JOIN subjects sub                   ON sse.subject_id = sub.subject_id
LEFT JOIN attendance_records ar
    ON ar.student_id  = s.student_id
   AND ar.semester_id = sse.semester_id
WHERE s.roll_number   = ?
  AND sse.semester_id = ?
GROUP BY sub.subject_id
ORDER BY sub.subject_name
';
SET @roll_number = '25CS001';
SET @semester_id = 1;
EXECUTE stmt USING @roll_number, @semester_id;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- VIEW 4: College-wide summary (Dashboard stats)
-- All years — total students, count below 80%, avg %
-- Input: @semester_id
-- ============================================================
PREPARE stmt FROM '
SELECT
    s.current_year AS academic_year,
    COUNT(DISTINCT s.student_id) AS total_students,
    SUM(CASE WHEN pct.attendance_pct < 80 THEN 1 ELSE 0 END) AS below_80,
    ROUND(AVG(pct.attendance_pct), 2) AS avg_attendance_pct
FROM students s
JOIN (
    SELECT
        ar.student_id,
        ROUND(
            SUM(CASE WHEN ar.status IN (''PRESENT'', ''OD'') THEN 1 ELSE 0 END) * 100.0
            / NULLIF(COUNT(*), 0),
        2) AS attendance_pct
    FROM attendance_records ar
    WHERE ar.semester_id = ?
    GROUP BY ar.student_id
) pct ON pct.student_id = s.student_id
GROUP BY s.current_year
ORDER BY s.current_year
';
SET @semester_id = 1;
EXECUTE stmt USING @semester_id;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- VIEW 5: Recent Audit Entries (Dashboard widget — last 5)
-- No input needed
-- ============================================================
SELECT
    aal.changed_at,
    s.roll_number,
    s.name          AS student_name,
    ar.date         AS attendance_date,
    ts.slot_number  AS period,
    aal.old_status,
    aal.new_status
FROM attendance_audit_log aal
JOIN attendance_records ar ON aal.record_id  = ar.record_id
JOIN students s            ON ar.student_id  = s.student_id
JOIN timetable_slots ts    ON ar.slot_id     = ts.slot_id
ORDER BY aal.changed_at DESC
LIMIT 5;

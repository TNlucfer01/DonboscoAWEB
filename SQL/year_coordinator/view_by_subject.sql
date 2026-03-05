USE donbosco_attendance;

-- ============================================================
-- YC: Attendance View — By Subject
-- Shows attendance per student for a chosen subject in a semester
-- Inputs: @subject_id, @semester_id, @academic_year
-- ============================================================
PREPARE stmt FROM '
SELECT
    s.roll_number,
    s.name              AS student_name,
    b.name              AS batch,
    sub.subject_name,
    COUNT(ar.record_id) AS total_periods,
    SUM(CASE WHEN ar.status IN (''PRESENT'', ''OD'') THEN 1 ELSE 0 END) AS attended,
    ROUND(
        SUM(CASE WHEN ar.status IN (''PRESENT'', ''OD'') THEN 1 ELSE 0 END) * 100.0
        / NULLIF(COUNT(ar.record_id), 0),
    2) AS attendance_pct,
    CASE WHEN
        ROUND(SUM(CASE WHEN ar.status IN (''PRESENT'',''OD'') THEN 1 ELSE 0 END) * 100.0
        / NULLIF(COUNT(ar.record_id), 0), 2) < 80
    THEN ''⚠ BELOW 80%'' ELSE ''OK'' END AS flag
FROM student_subject_enrollment sse
JOIN students s       ON sse.student_id  = s.student_id
JOIN subjects sub     ON sse.subject_id  = sub.subject_id
JOIN batches b        ON s.batch_id      = b.batch_id
LEFT JOIN attendance_records ar
    ON ar.student_id  = s.student_id
   AND ar.semester_id = sse.semester_id
WHERE sse.subject_id  = ?
  AND sse.semester_id = ?
  AND s.current_year  = ?
GROUP BY s.student_id, sub.subject_id
ORDER BY attendance_pct ASC
';
SET @subject_id   = 1;
SET @semester_id  = 1;
SET @academic_year = 1;
EXECUTE stmt USING @subject_id, @semester_id, @academic_year;
DEALLOCATE PREPARE stmt;

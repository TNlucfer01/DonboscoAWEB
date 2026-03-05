USE donbosco_attendance;

-- ==========================================
-- TEST SCRIPT 2: DATA RETRIEVALS / VIEWS
-- ==========================================

-- VIEW 1: All Users and their Roles
SELECT user_id, name, phone_number, role 
FROM users 
ORDER BY role, name;

-- VIEW 2: Batch Information and Capacity
SELECT b.batch_id, b.name AS batch_name, b.batch_type, b.year, b.capacity,
       COUNT(s.student_id) AS enrolled_students
FROM batches b
LEFT JOIN students s ON b.batch_id = s.batch_id
GROUP BY b.batch_id;

-- VIEW 3: Detailed Student Roster (Student + Batch + Current Semester)
SELECT s.roll_number, s.name AS student_name, b.name AS batch_name, sem.name AS current_semester
FROM students s
JOIN batches b ON s.batch_id = b.batch_id
JOIN student_batch_enrollment sbe ON s.student_id = sbe.student_id
JOIN semesters sem ON sbe.semester_id = sem.semester_id
ORDER BY s.roll_number;

-- VIEW 4: Subjects by Semester
SELECT sem.name AS semester, sub.subject_name, sub.credits
FROM subjects sub
JOIN student_subject_enrollment sse ON sub.subject_id = sse.subject_id
JOIN semesters sem ON sse.semester_id = sem.semester_id
GROUP BY sem.name, sub.subject_name, sub.credits
ORDER BY sem.name, sub.subject_name;

-- VIEW 5: Daily Attendance Sheet View (Date, Student, Slot, Status, Marked By)
SELECT a.date, ts.start_time, ts.end_time, s.roll_number, s.name AS student_name, a.status, u.name AS marked_by_staff
FROM attendance_records a
JOIN students s ON a.student_id = s.student_id
JOIN timetable_slots ts ON a.slot_id = ts.slot_id
JOIN users u ON a.submitted_by = u.user_id
WHERE a.date = '2026-03-05'
ORDER BY ts.start_time, s.roll_number;

-- VIEW 6: Principal's Audit Log View (Changes in Attendance)
SELECT aal.changed_at, s.roll_number, s.name AS student_name, a.date, aal.old_status, aal.new_status, u.name AS audited_by
FROM attendance_audit_log aal
JOIN attendance_records a ON aal.record_id = a.record_id
JOIN students s ON a.student_id = s.student_id
JOIN users u ON aal.changed_by = u.user_id
ORDER BY aal.changed_at DESC;

-- VIEW 7: System Notifications Status
SELECT nl.trigger_date, s.roll_number, s.name AS student_name, nl.message_sent, nl.status
FROM notification_log nl
JOIN students s ON nl.student_id = s.student_id
ORDER BY nl.trigger_date DESC;

-- VIEW 8: College Calendar Events
SELECT c.date, c.day_type, c.holiday_name, u.name AS declared_by
FROM college_calendar c
LEFT JOIN users u ON c.declared_by = u.user_id
ORDER BY c.date;

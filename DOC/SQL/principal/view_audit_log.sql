USE donbosco_attendance;

-- Q3.5: View Audit Log
-- No user inputs are present in this view, but formatting it as a prepared statement for consistency if needed:
PREPARE stmt FROM '
SELECT aal.changed_at, s.name as student_name, s.roll_number, ar.date, ts.slot_number, 
       aal.old_status, aal.new_status
FROM attendance_audit_log aal
INNER JOIN attendance_records ar ON aal.record_id = ar.record_id
INNER JOIN students s ON ar.student_id = s.student_id
INNER JOIN timetable_slots ts ON ar.slot_id = ts.slot_id
ORDER BY aal.changed_at DESC;
';

EXECUTE stmt;

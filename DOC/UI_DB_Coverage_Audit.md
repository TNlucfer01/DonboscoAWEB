# UI-to-DB Coverage Audit
**Date**: 2026-03-05 | **Version**: v4.0 Schema + Seed Data

> **Question**: After seeding, can each user role complete their tasks using only the existing DB and queries?

---

## Summary Verdict

| Role | UI Completeness | Query Coverage | Gap |
|---|---|---|---|
| **Principal** | 8 screens | ✅ 5/8 fully covered | ❌ 3 screens missing queries |
| **Year Co-ordinator** | 6 screens | ✅ 5/6 fully covered | ⚠️ 1 partial |
| **Subject Staff** | 2 screens | ✅ 2/2 fully covered | ✅ None |

---

## 🔑 Role: Principal

### ✅ Screen: Login
- Uses `users` table — `phone_number` + `password_hash`. ✅ Supported.

### ✅ Screen: Add Subject (`principal/add_subject.sql`)
- INSERT into `subjects` (name, year, description, credits, semester). ✅ Works.
- **BUT**: UI Design.md line 89 still shows "Department dropdown" — this field was removed from the schema. `UI Design.md` needs updating.

### ✅ Screen: Holiday Marking (`principal/declare_holiday.sql`)
- INSERT into `college_calendar` with `declared_by = user_id`. ✅ Works.
- Reading calendar for the calendar view: needs a `SELECT * FROM college_calendar ORDER BY date` — exists in `07_college_calendar_crud.sql`. ✅

### ✅ Screen: Attendance Correction (`principal/correct_attendance.sql` + `insert_audit_log.sql`)
- UPDATE `attendance_records` + INSERT `attendance_audit_log`. ✅ Works.

### ✅ Screen: Audit Log (`principal/view_audit_log.sql`)
- Full JOIN query across `attendance_audit_log`, `attendance_records`, `students`, `timetable_slots`. ✅ Works.

### ✅ Screen: Add Staff
- Uses standard INSERT into `users` — exists in `01_users_crud.sql`. ✅ Works.

### ❌ Screen: Principal Dashboard (Homepage)
(yeah actually for now we don't know how we might want to represent  the data and this is the  functionality are same as below add them too )
**Missing queries for:**
- College-wide attendance % graph → needs aggregated query across all students + semesters
- Total students count, # below 80%, recent corrections count → no dashboard query exists
- "Recent Audit Entries (last 5)" → partial — `view_audit_log.sql` exists but needs `LIMIT 5`

### ❌ Screen: Attendance View (college-wide multi-view)
- No SELECT query exists for multi-view (by batch, by subject, by calendar+period, by %) for **all years**
- The YC year-level report exists (`year_coordinator/` folder) but not for all years combined
yes add that in which he will able to see as e wants if selects sunjects then he will be able to see by subject , year,semster,rollno

### ❌ Screen: Reports (PDF/Export)
- No reporting query (filter by year/batch/subject/date range/semester/status threshold)
- Export mechanism is application-layer, but underlying query is missing
(hold this future  not right now )

### ⚠️ Screen: Batch Approval
- Batch INSERT exists in `02_batches_crud.sql`. But approval flow (Principal approves batches proposed by YC) has no dedicated query — no "pending approval" status in `batches` table. Likely needs an app-layer workaround.

there is a miss understandding that is the batches are  entereed while inserting the student only so there no for each year there willl be four batch while in lab  period (4 batches ) while in  theory (there wil be 2  batches only ) can we just seed this can' we 
---

## 📋 Role: Year Co-ordinator

### ✅ Screen: Add Student (`year_coordinator/add_student.sql`)
- INSERT into `students`. ✅ Works.
- **BUT**: Missing new fields from v4.0 — `phone`, `email`, `dob`, `gender`, `address` are not in this query. The INSERT only has `name, roll_number, parent_phone, current_year, batch_id`.

### ✅ Screen: Batch Management / Subject Mapping
- `student_batch_enrollment` and `student_subject_enrollment` INSERTs exist. ✅

### ✅ Screen: OD / Informed Leave Entry (`year_coordinator/pre_enter_od.sql` + `pre_enter_il.sql`)
- INSERT INFORMED_LEAVE / OD directly into `attendance_records` with `is_locked = TRUE`. ✅ Works.

### ✅ Screen: Attendance View — Batch + Year Report
- `year_coordinator/attendance_report.sql` → attendance % per student. ✅
- `year_coordinator/batch_summary.sql` → batch-level student count. ✅

### ✅ Screen: YC Dashboard
- Batch overview: `batch_summary.sql` covers it.
- Attendance % and "# below 80%": `attendance_report.sql` can derive this. ✅

### ⚠️ Screen: Attendance View (multi-view — By Subject, By Calendar+Period, By %)
- "By Batch" and "By Year %" exist.
- **Missing**: "By Subject" view (needs JOIN through `student_subject_enrollment` + `subjects`)
- **Missing**: "By Calendar + Period" (date × slot filtered view)
add that 

---

## 👨‍🏫 Role: Subject Staff

### ✅ Screen: Take Attendance (`staff/fetch_students.sql` + `submit_attendance.sql`)
- **Fetch**: SELECT students by batch+semester with LEFT JOIN to current locked OD/IL rows. ✅
- **Submit**: INSERT with `ON DUPLICATE KEY UPDATE` — handles re-submission cleanly. ✅
- Timer (20-min enforcement) is application-layer, not DB.

### ✅ Screen: My Past Submissions
- Can query `attendance_records WHERE submitted_by = ?` — no dedicated file but query is trivial using CRUD 10. ✅

---

## 🚨 Missing Queries — What Needs to Be Created

| Priority | Missing Query | Used By |
|---|---|---|
| 🔴 HIGH | Principal Dashboard aggregates (total students, below 80%, college-wide %) | Principal |
| 🔴 HIGH | College-wide attendance multi-view (by batch/subject/date for all years) | Principal |
| 🔴 HIGH | Reports filter query (year + batch + subject + date range + % threshold) | Principal + YC |
| 🟡 MED | YC "By Subject" attendance view | YC |
| 🟡 MED | YC "By Calendar + Period" view | YC |
| 🟡 MED | Update `add_student.sql` to include new fields (phone/email/dob/gender/address) | YC |
| 🟢 LOW | `fetch_students.sql` — add check for 20-min window (app-layer, not DB) | Staff |

---

## 🐛 UI Design Doc Issue Found

> **`UI Design.md` Line 89**: Still shows `"Department"` dropdown in the Add Subject screen.
> This was removed from the schema in v4.0. The UI doc needs updating.

---

## ✅ What Works Right Now (Post-Seed)

After running `01_schema.sql` + `02_seed_test_data.sql`, the following flows work end-to-end with existing queries:

1. ✅ Staff → Select Year+Batch+Period → Fetch Students → Mark Present/Absent → Submit
2. ✅ YC → Add Student (basic fields) → Enroll in Batch → Enroll in Subject
3. ✅ YC → Pre-enter OD/IL for future date (row locked immediately)
4. ✅ Principal → Mark Holiday → blocks that date
5. ✅ Principal → Correct Attendance → Audit Log entry created
6. ✅ Principal → View Audit Log (full detail with student + slot)
7. ✅ Principal → Add Subject
8. ✅ Principal → Add Staff

## Links
- [[UI Design]]
- [[Database Design]]
- [[SQL_Test_Issues]]

# DB Design Issues Scan
**Date**: 2026-03-05 | **Schema**: v4.0 | **Scan Type**: Manual review of schema + FK constraints + data flow

---

## ✅ Fixed This Session
| Fix | File |
|---|---|
| Added `email` column to `users` (UNIQUE, NOT NULL) — login uses email now | `01_schema.sql` |
| Updated `01_users_crud.sql` with email in all queries + login-by-email SELECT | `01_users_crud.sql` |
| Seeded all 8 semesters (Odd/Even × 4 years) | `02_seed_test_data.sql` |

---

## 🔴 Critical Issues

### ISSUE-1: `subjects.semester` is a VARCHAR — should be ENUM
- **Current**: `semester VARCHAR(20) NOT NULL` — accepts any string like `'odd'`, `'ODD'`, `'Odd'`, `'Autumn'`
- **Risk**: Data inconsistency. A JOIN like `WHERE sub.semester = 'Odd'` will silently return nothing if the value was stored as `'ODD'`.
- **Fix**: Change to `ENUM('ODD', 'EVEN') NOT NULL` do this 

### ISSUE-2: `batches.year` and `semesters.academic_year` are unlinked — no FK
- **Current**: `students.current_year`, `batches.year`, `semesters.academic_year` all store a year (1–4) as plain TINYINT — nothing enforces they match.
- **Risk**: A student in `current_year=1` can be enrolled in a `batch` with `year=3`. The DB allows it.
- **Fix**: Add a CHECK constraint or enforce at application layer with a validation query before enrollment. yes they should match

### ISSUE-3: `attendance_records` has no `subject_id` — can't tell which subject a period belongs to
- **Current**: A record stores `(student_id, date, slot_id, status)` — but there is no reference to which subject was taught in that slot.
- **Risk**: Cannot generate per-subject attendance. The `view_by_subject.sql` query counts ALL attendance records for a student in a semester — not subject-specific ones. This is a structural gap.
- **Fix** (two options):
  - **Option A** (simple): Add `subject_id INT NULLABLE` to `attendance_records`. Staff selects subject when marking. NULL = not assigned. we do this 
  - **Option B** (complex): Create a `timetable` table mapping `(date, slot_id, subject_id, batch_id)` and link attendance records to it.
  - ⚡ **Recommendation**: Option A — matches the "staff picks subject at mark-time" design decision from Round 6.

### ISSUE-4: `users` table — no `year` field for Year Co-ordinator
- **Current**: A `YEAR_COORDINATOR` user has no stored `academic_year` — the app has no way to know which year they manage. add that 
- **Risk**: The YC dashboard filter (show only their year's students) has no DB basis. Any YC user can query any year.
- **Fix**: Add `managed_year TINYINT NULLABLE` to `users`. Set it for YEAR_COORDINATOR rows; NULL for PRINCIPAL and SUBJECT_STAFF.

---

## 🟡 Medium Issues

### ISSUE-5: No UNIQUE constraint on `(subject_name, subject_year, semester)`
- **Current**: The same subject can be inserted multiple times with different `subject_id` values.
- **Risk**: Duplicate subjects, orphaned enrollments. we can add this constraint
- **Fix**: Add `UNIQUE (subject_name, subject_year, semester)`

### ISSUE-6: `attendance_records` UNIQUE constraint is `(student_id, date, slot_id)` — missing `semester_id`
- **Current**: `UNIQUE (student_id, date, slot_id)`
- **Risk**: If a student repeats a year (same date, same slot, different semester), the insert would hit a UNIQUE clash even though it's a different semester. we can add this constraint
- **Fix**: Change to `UNIQUE (student_id, date, slot_id, semester_id)`

### ISSUE-7: No `subject_staff` assignment to year
- **Current**: Subject Staff `(SUBJECT_STAFF)` has no stored relationship to a year, batch, or subject.
- **Risk**: Any staff member can mark attendance for any batch in any year — no restriction possible at DB level.
- **Fix** (matches Round 6 decision of no pre-assignment): Enforce at application layer with role-check + audit trail rather than adding a mapping table. we can't do this. i want it that way for now 

### ISSUE-8: `college_calendar` has no `semester_id`
- **Current**: Holidays are college-wide, tied to a `date` only.
- **Risk**: The attendance % formula `(Present + OD) / (Total - Holidays)` needs to know which holidays apply to which semester. Without `semester_id`, a holiday in Semester 1 would also affect Semester 2 calculations if date ranges overlap.
- **Fix**: Add `semester_id INT NOT NULL FK → semesters` to `college_calendar`. Alternatively keep it calendar-date-based and filter by semester date range in the query (no schema change).

---

## 🟢 Minor / Design Notes

### NOTE-1: `timetable_slots.slot_type` is ENUM('THEORY', 'LAB') — may need 'BREAK'
- Slot 2 ends at 11:30 and slot 3 starts at 11:30 — there is no break slot in between, which is realistic. But if a lunch/break period needs to be represented (for future calendar UI), an 'OTHER' type would be useful. we can add this 

### NOTE-2: `notification_log` has no `parent_phone` snapshot
- The parent phone is read from `students.parent_phone` at notification time. If the phone changes later, there's no record of which phone actually received the SMS.
- **Fix**: Add `sent_to_phone VARCHAR(15)` to `notification_log`. we can add this 

### NOTE-3: `batches.capacity` is never validated against student count
- `capacity` is stored but there is no CHECK or trigger to prevent adding more students than capacity allows.
- **Fix**: Enforce at application layer before batch enrollment. we can add this 
the capacity shoud increase as the students added for that batch (dynamically i would be happy f this can happen at DB  or in the backend )
---

## Priority Order for Fixes

| Priority | Issue | Impact |
|---|---|---|
| 🔴 1 | ISSUE-3: Add `subject_id` to `attendance_records` | Per-subject attendance is broken without this |
| 🔴 2 | ISSUE-4: Add `managed_year` to `users` | YC year access enforcement impossible without this |
| 🔴 3 | ISSUE-1: `subjects.semester` → ENUM | Silent data bugs |
| 🟡 4 | ISSUE-5: UNIQUE on subjects | Duplicate subject prevention |
| 🟡 5 | ISSUE-6: Fix UNIQUE constraint on attendance_records | Repeated-year edge case |
| 🟢 6 | NOTE-2: Add `sent_to_phone` to notification_log | Audit completeness |

## Links
- [[Database Design]]
- [[Requirements Audit]]
- [[SQL_Test_Issues]]

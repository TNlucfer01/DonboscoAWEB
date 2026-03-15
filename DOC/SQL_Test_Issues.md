# SQL Test Run — Issues Found
**Date**: 2026-03-05 | **DB**: `donbosco_attendance` | **Schema Version**: v4.0

> All 12 CRUD files were executed against the live MariaDB database. Issues are listed by file.

---

## ✅ Files That Ran Clean
| File | Result |
|---|---|
| `01_schema.sql` | ✅ All tables created, timetable_slots seeded |
| `01_users_crud.sql` | ✅ Insert, Read, Update, Delete all OK |
| `02_batches_crud.sql` | ✅ Ran OK but see Issue #1 below |
| `03_semesters_crud.sql` | ✅ Ran OK but see Issue #2 below |
| `04_subjects_crud.sql` | ✅ Ran OK |
| `05_students_crud.sql` | ✅ Ran OK |
| `06_timetable_slots_crud.sql` | ✅ Ran OK but see Issue #3 below |

---

## ❌ Files That Had Errors

### CRUD 07 — `college_calendar_crud.sql`
**Error**: `FK constraint fails on declared_by = 4`
- **Root cause**: Hardcoded `@declared_by = 4` but only 1 user exists (`user_id = 1`).
- **Fix**: Change `@declared_by = 4` → `@declared_by = 1` in the CRUD file.

### CRUD 08 — `student_batch_enrollment_crud.sql`
**Error**: `FK constraint fails on UPDATE with batch_id = 2`
- **Root cause**: The UPDATE moves student to `batch_id = 2`, but only 1 batch exists (`batch_id = 1`). The INSERT part ran fine.
- **Fix**: Change `@new_batch_id = 2` → `@new_batch_id = 1` (or add a second batch in seed data).

### CRUD 09 — `student_subject_enrollment_crud.sql`
**Error**: `FK constraint fails on UPDATE with a new subject_id`
- **Root cause**: UPDATE references a `subject_id` that doesn't exist after the previous DELETE in the same run.
- **Fix**: Guard the UPDATE with a valid existing `subject_id`, or reorder the UPDATE before DELETE.

### CRUD 10 — `attendance_records_crud.sql`
**Error**: `FK constraint fails on student_id`
- **Root cause**: Hardcoded `@student_id` in INSERT doesn't match any enrolled student at that point in script execution order. The CRUD files are not run in dependency order.
- **Fix**: Run CRUD files in the correct dependency order (see section below).

### CRUD 11 — `attendance_audit_log_crud.sql`
**Error**: `FK constraint fails on record_id`
- **Root cause**: INSERT references a `record_id` that doesn't exist — CRUD 10 already failed, so no attendance record was created.
- **Fix**: Depends on CRUD 10 being fixed first.

### CRUD 12 — `notification_log_crud.sql`
**Error**: `FK constraint fails on student_id`
- **Root cause**: Same root cause as CRUD 10 — student data from enrollments not available when these CRUDs run independently.
- **Fix**: Run as part of the full ordered sequence.

---

## ⚠️ Data Issues Found (No Error, But Wrong Data)

### Issue #1 — `batches` capacity defaulted
- **File**: `02_batches_crud.sql`
- **Problem**: First batch was inserted with `capacity = 0` in a previous session. The initial schema run does not seed any batches. If the CRUD INSERT sets `capacity = 0`, every new batch will default to 0.
- **Current live state**: `batch_id=1, name="CS A Section (T)", capacity=1`
- **Fix**: Ensure CRUD example values use realistic capacities (`50` for THEORY, `25` for LAB).

### Issue #2 — `semesters.year` is wrong
- **File**: `03_semesters_crud.sql`
- **Problem**: The live semester has `year = 2` but `name = "Semester 1 (Odd)"`. Year 2 means 2nd year students, but Odd = Semester 1 of a year. The CRUD example uses `@year = 2` — this is inconsistent.
- **Fix**: Change `@year = 2` → `@year = 1` in the CRUD example, OR clarify what `year` means in `semesters` (academic year 1–4 or semester number 1–8?).

> ⚡ **Design ambiguity**: `semesters.year` (TINYINT 1–4) represents the academic year (1st/2nd/3rd/4th year), NOT the semester number. The column name `year` is confusing — consider renaming to `academic_year`.

### Issue #3 — Slot 2 time was corrupted by CRUD 06
- **File**: `06_timetable_slots_crud.sql`
- **Problem**: The UPDATE in CRUD 06 changes `slot_id = 2` to `08:00:00–09:00:00`, overwriting the correct seeded time of `10:30:00–11:30:00`. The CRUD was doing a "test update" but didn't reset it.
- **Current live state**: Slot 2 = `08:00:00 – 09:00:00` ❌ (should be `10:30:00 – 11:30:00`)
- **Fix**: Remove or comment out the UPDATE example in CRUD 06, OR add a reset after the UPDATE.

### Issue #4 — No Principal user exists
- **Problem**: The schema does not seed a Principal user. But `college_calendar`, `attendance_records`, and `attendance_audit_log` all require a `user_id` FK with role PRINCIPAL. The CRUD examples assume `user_id = 1` or `user_id = 4` exists and is PRINCIPAL — but after running users CRUD, `user_id = 1` has role `YEAR_COORDINATOR`.
- **Fix**: Either seed a Principal in `01_schema.sql`, or update CRUD example values to match the seeded role. The Principal should be created first.

### Issue #5 — `student_batch_enrollment` and `student_subject_enrollment` not seeded before `attendance_records`
- **Problem**: `attendance_records` requires a student enrolled in a semester. The CRUD files assume enrollments exist but there is no guaranteed INSERT order across files.
- **Fix**: Create a `02_seed_test_data.sql` file that inserts a full working chain: Principal → Batch → Semester → Student → Enrollment → Subject → Subject Enrollment → Attendance Record.

---

## 🔧 Recommended Correct Execution Order

When running CRUDs for testing, use this dependency order:

```
1. 01_schema.sql        ← Create all tables + seed slots
2. 01_users_crud.sql    ← Insert PRINCIPAL first
3. 02_batches_crud.sql  ← Insert batches
4. 03_semesters_crud.sql ← Insert semesters
5. 04_subjects_crud.sql  ← Insert subjects
6. 05_students_crud.sql  ← Insert students
7. 08_student_batch_enrollment_crud.sql  ← Enroll students in batches
8. 09_student_subject_enrollment_crud.sql ← Enroll students in subjects
9. 07_college_calendar_crud.sql  ← Add holidays (needs a PRINCIPAL user)
10. 10_attendance_records_crud.sql ← Mark attendance
11. 11_attendance_audit_log_crud.sql ← Log corrections
12. 12_notification_log_crud.sql   ← Log SMS
```

> Note: `06_timetable_slots_crud.sql` should only be run if you actually need to add new slots — the schema already seeds slots 1–5.

---

## 📋 Summary of Fixes Needed

| # | File | Fix |
|---|---|---|
| 1 | `07_college_calendar_crud.sql` | Change `@declared_by = 4` → `@declared_by = 1` (or a valid Principal ID) |
| 2 | `08_student_batch_enrollment_crud.sql` | Change `@new_batch_id = 2` → valid existing batch_id |
| 3 | `09_student_subject_enrollment_crud.sql` | Fix UPDATE order — don't reference deleted subject |
| 4 | `06_timetable_slots_crud.sql` | Remove or comment out the UPDATE or add a reset |
| 5 | `01_schema.sql` or new seed file | Seed a PRINCIPAL user at deployment |
| 6 | `03_semesters_crud.sql` | Fix `@year = 2` → `@year = 1` in example; clarify column naming |
| 7 | Schema design | Rename `semesters.year` → `semesters.academic_year` to reduce confusion |
| 8 | All dependent CRUDs | Create `02_seed_test_data.sql` with correct insertion order |

## Links
- [[Database Design]]
- [[Requirements Audit]]

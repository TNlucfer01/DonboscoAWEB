# Student Database — Entity Model
**v5.0 — Updated 2026-03-05.** Departments removed. Email login added. `managed_year` added for YC. `subject_id` added to attendance. `student_count` trigger on batches. `sent_to_phone` snapshot on notifications.

## Entities and Fields

### 1. Users
All system login accounts.
- `user_id` (PK)
- `name`
- `email` — **used for login** (UNIQUE, NOT NULL)
- `phone_number` — used for SMS/OTP resets (UNIQUE)
- `role` — enum: `PRINCIPAL`, `YEAR_COORDINATOR`, `SUBJECT_STAFF`
- `managed_year` — 1–4 for YC only; NULL for Principal and Staff
- `password_hash`
- `created_at`, `updated_at`

> `managed_year` enforced by CHECK constraint: YC must have 1–4, all others must be NULL.

### 2. Students
- `student_id` (PK)
- `name`
- `roll_number` (UNIQUE)
- `phone` — student's own phone (optional)
- `email` — student email (optional)
- `dob` — date of birth (optional)
- `gender` — enum: `MALE`, `FEMALE`, `OTHER` (optional)
- `address` — residential address (optional)
- `parent_phone` — **required** (used for SMS alerts)
- `current_year` — 1–4
- `batch_id` (FK → Batches)
- `created_at`, `updated_at`

### 3. Batches
Fixed college structure — seeded once at deployment (24 total: 6 per year × 4 years).
- `batch_id` (PK)
- `name` — e.g., "1st Year - Theory A"
- `batch_type` — enum: `THEORY`, `LAB`
- `year` — 1–4
- `capacity` — max students (50 theory / 25 lab)
- `student_count` — **auto-updated by trigger** when students enroll/unenroll

### 4. Student Batch Enrollment
Links a student to a batch for a specific semester.
- `enrollment_id` (PK)
- `student_id` (FK → Students)
- `batch_id` (FK → Batches)
- `semester_id` (FK → Semesters)
- `UNIQUE (student_id, batch_id, semester_id)`

> Inserting here auto-increments `batches.student_count` via DB trigger.

### 5. Subjects
All subjects created globally by the Principal. No department grouping.
- `subject_id` (PK)
- `subject_name`
- `subject_year` — which year (1–4)
- `subject_description` (optional)
- `credits`
- `semester` — **ENUM: `ODD`, `EVEN`** (enforces consistent casing)
- `created_at`, `updated_at`
- `UNIQUE (subject_name, subject_year, semester)` — prevents duplicates

### 6. Student Subject Enrollment
- `enrollment_id` (PK)
- `student_id` (FK → Students)
- `subject_id` (FK → Subjects)
- `semester_id` (FK → Semesters)
- `UNIQUE (student_id, subject_id, semester_id)`

### 7. Semesters
8 semesters seeded at deployment (Odd + Even × 4 years).
- `semester_id` (PK)
- `name`
- `academic_year` — 1–4 (year of study; NOT semester number)
- `is_active` — boolean; only ONE semester should be active at a time

### 8. Timetable Slots
The 5 fixed daily periods, seeded in schema.
- `slot_id` (PK)
- `slot_number` — 1 to 5
- `start_time`, `end_time`
- `slot_type` — enum: `THEORY`, `LAB`, `OTHER`

### 9. College Calendar
- `calendar_id` (PK)
- `date` (UNIQUE)
- `day_type` — enum: `WORKING`, `HOLIDAY`, `SATURDAY_ENABLED`
- `holiday_name`, `holiday_description` — nullable
- `declared_by` (FK → Users — must be PRINCIPAL)
- `declared_on`

### 10. Attendance Records
- `record_id` (PK)
- `student_id` (FK → Students)
- `semester_id` (FK → Semesters)
- `subject_id` (FK → Subjects, **NULLABLE**) — staff picks subject at mark-time
- `date`
- `slot_id` (FK → Timetable Slots)
- `status` — enum: `PRESENT`, `ABSENT`, `OD`, `INFORMED_LEAVE`
- `od_reason` — text, nullable
- `submitted_by` (FK → Users)
- `submitted_at`
- `is_locked` — boolean; locked rows cannot be edited by staff
- `UNIQUE (student_id, date, slot_id, semester_id)`

> `subject_id` is nullable because staff selects the subject dynamically when marking. NULL means unassigned.

### 11. Attendance Audit Log
Immutable log — created only when Principal makes a correction.
- `audit_id` (PK)
- `record_id` (FK → Attendance Records)
- `changed_by` (FK → Users — Principal)
- `old_status`, `new_status`
- `changed_at`

### 12. Notification Log
Per-period and monthly summary SMS only.
- `log_id` (PK)
- `student_id` (FK → Students)
- `semester_id` (FK → Semesters)
- `sent_to_phone` — **snapshot of parent_phone at send time** (immutable)
- `trigger_type` — enum: `PER_PERIOD`, `MONTHLY_SUMMARY`
- `trigger_date`
- `attendance_percentage`
- `message_sent`
- `sent_at`
- `status` — enum: `SENT`, `FAILED`

## Links
- [[attendance Donbosco]]
- [[User Account Management]]
- [[Database Design]]
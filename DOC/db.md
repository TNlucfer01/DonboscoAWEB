# db.md — Scratch Notes

## Live DB State (2026-03-04)

### `batches` snapshot
```
batch_id | name            | batch_type | year | capacity
1        | CS C 2nd Yr (T) | THEORY     | 2    | 0         ← capacity defaulted to 0; fix on next insert
```

### `students` snapshot
```
student_id | name   | roll_number | parent_phone | current_year | batch_id
1          | Harini | 24CS005     | 9876500001   | 1            | 1
```

---

## Resolved Questions (→ see [[Requirements Audit]] Round 6)

| # | Question | Answer |
|---|---|---|
| 1 | Why `capacity = 0`? | Not set during first insert. Must pass capacity explicitly when adding a batch. |
| 2 | Why do we need enrollment of student in batch AND subject? | Batch enrollment = *"where do you sit"*. Subject enrollment = *"what do you study"* (needed for electives/ELM). Both required. |
| 3 | Who can edit leave/holiday calendar? | **Principal only.** Enforced at application layer via role check before any INSERT/UPDATE on `college_calendar`. |

---

## v4.0 Schema Changes Applied (2026-03-05)
- `departments` table and `dept_id` FK → **removed everywhere**
- `students` → added `phone`, `email`, `dob`, `gender`, `address`
- `semesters` → added `is_active` (only one TRUE at a time)
- No timetable→subject mapping, no staff pre-assignment table, no OD workflow table, no student leave table

## Links
- [[Database Design]]
- [[Requirements Audit]]

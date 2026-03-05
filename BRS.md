# Business Requirements Specification (BRS)
**Project**: Donbosco Agricultural College — Attendance Management System
**Version**: 2.0 (Updated) | **Date**: 2026-03-03 | **Location**: Uriyur

---

## 1. Executive Summary
Donbosco Agricultural Engineering College requires a digital attendance management system to replace paper-based tracking. The system tracks student attendance per class period, enforces attendance thresholds, notifies parents, and provides management reports.

---

## 2. Business Goals

| Goal | Description |
|---|---|
| G1 | Automate per-period attendance capture by Subject Staff |
| G2 | Provide the Principal with real-time oversight of all student attendance |
| G3 | Alert parents immediately and monthly when attendance drops |
| G4 | Enforce academic integrity through the 80% attendance threshold |
| G5 | Eliminate paper-based attendance registers |
| G6 | Maintain a tamper-proof audit trail of all data changes |

---

## 3. Stakeholders

| Role                  | Responsibility                                | Interaction                    |
| --------------------- | --------------------------------------------- | ------------------------------ |
| **Principal**         | Admin, approvals, oversight, corrections      | Dashboard + all pages          |
| **Year Co-ordinator** | Year-level management, student data, OD/leave | Dashboard + data entry         |
| **Subject Staff**     | Daily attendance entry per batch              | Attendance submission          |
| **Parents**           | Receive SMS alerts                            | SMS receiver (no login)        |
| **Students**          | Submit physical leave forms                   | Physical forms only — no login |

---

## 4. Business Rules

### 4.1 Attendance Calculation
- `Attendance % = (Present + OD) / (Total Periods − College Holidays) × 100`
- Informed Leave = Absent (does not boost %)
- College Holidays are excluded from the denominator

### 4.2 Batch Structure
- 1 Year = ~100 students
- Theory: 2 Batches (A: 50, B: 50)
- Lab: 4 Batches (1–4: 25 each)
- 1 Year Co-ordinator manages all batches in a year
- YC assigns batch number when adding a student

### 4.3 Daily Schedule
| Period | Time | Type |
|---|---|---|
| 1st | 7:30–10:00 AM | Lab |
| 2nd | 10:30–11:30 AM | Theory |
| 3rd | 11:30–12:30 PM | Theory |
| Lunch | 12:30–1:30 PM | Non-period |
| 4th | 1:30–2:30 PM | Theory |
| 5th | 2:45–5:15 PM | Lab |

### 4.4 Staff Attendance Flow
- Staff selects: Year → Batch → Period → Fetch Students → Mark Present/Absent → Submit.
- **No subject-staff mapping.** Any staff can take attendance for any batch/period.
- Submission within 20 minutes of the slot start (server-enforced).

### 4.5 Leave Policy
- **OD (On Duty)**: Counts as Present. YC pre-enters for **future days only** with reason.
- **Informed Leave**: Counts as Absent. Pre-entered by YC for **future days only**. Principal checks % ≥ 80% before signing.
- **Uninformed Leave**: Auto-set for unlocked Absent students after staff submits.
- Pre-entered OD/IL rows lock the student's row in the staff's attendance table.

### 4.6 SMS Notification Policy
| Trigger | Condition | Timing |
|---|---|---|
| Per-period alert | Student marked Absent (unlocked) | Immediately on submission |
| Monthly warning | Cumulative attendance < 80% | End of every month |

### 4.7 Corrections
- Staff reports to YC → YC escalates to Principal.
- **Principal's correction page** is the same layout as the staff attendance page, but can select any date (past or future) for any student. Principal can set: **Present, Absent, OD, Informed Leave**.
- Every Principal edit is logged in the Audit Log.

### 4.8 Academic Calendar
- Holidays declared by Principal via a calendar UI — with holiday name and description.
- Only future dates can be marked. System blocks attendance for holiday dates.
- Saturdays are off by default; Principal explicitly enables specific Saturdays.

---

## 5. Course Types

| Type | Year | Enrollment |
|---|---|---|
| Regular | 1–4 | Auto-enrolled when YC maps subject |
| Elective | 3rd year only | YC manually maps chosen students |
| ELM | 4th year only | YC manually maps students |

---

## 6. Constraints
- No student login or student-facing app
- All student leave requests are physical paper forms
- 4 years × 2 semesters = 8 active semester slots
- Principal account pre-seeded at deployment
- ~300 SMS per day capacity needed

---

## 7. Out of Scope
- Student-facing mobile app
- Online fee payment
- Deputy Principal fallback (deferred)
- Parent login portal
- Subject-staff pre-assignment (removed per requirement change)

## Links
- [[attendance Donbosco]]
- [[Requirements Audit]]

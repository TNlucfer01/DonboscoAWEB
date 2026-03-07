# Software Requirements Specification (SRS)
**Project**: Donbosco Agricultural College — Attendance Management System
**Version**: 3.0 (Node.js) | **Date**: 2026-03-05

---

## 1. Introduction

### 1.1 Purpose
This document specifies all functional and non-functional requirements for the Donbosco Attendance System.

### 1.2 Scope
A web-based attendance management system supporting per-period attendance entry, OD/Leave management, SMS alerts, and role-based reporting with audit trails.

### 1.3 Definitions
| Term | Meaning |
|---|---|
| YC | Year Co-ordinator |
| OD | On Duty — student on official college task |
| IL | Informed Leave — approved absence |
| UL | Uninformed Leave — unapproved absence (auto-set) |
| ELM | Experiential Learning Module (4th year) |
| Batch | Grouping of students (Theory: A/B; Lab: 1–4) |

---

## 2. Functional Requirements

### 2.1 Authentication Module

| ID | Requirement |
|---|---|
| FR-A1 | System shall support three roles: PRINCIPAL, YEAR_COORDINATOR, SUBJECT_STAFF |
| FR-A2 | Users shall log in with **email** and password |
| FR-A3 | Passwords shall be bcrypt hashed (rounds ≥ 10); minimum 8 characters |
| FR-A4 | Users shall reset passwords via OTP sent to registered phone |
| FR-A5 | Principal account shall be pre-seeded at deployment |
| FR-A6 | Failed login shall show generic error (not reveal which field is wrong) |

---

### 2.2 Principal Module

| ID | Requirement |
|---|---|
| FR-P1 | Principal shall see a **dashboard** (homepage) with college-wide attendance graphs, stats, and quick actions |
| FR-P2 | Principal shall have a **Staff CRUD** page: create, view, edit, and deactivate staff accounts |
| FR-P3 | Principal shall have a **Subject CRUD** page: create, view, edit, and delete subjects |
| FR-P4 | Principal shall have a **Holiday CRUD** page: select date from calendar → enter/edit holiday name + description; delete future holidays |
| FR-P5 | Only future dates can be marked as holidays; system blocks attendance for holiday dates |
| FR-P6 | Principal shall enable specific Saturdays as working days (before that Saturday) |
| FR-P7 | Principal shall have an **Attendance Correction** page: select Year + Date → table shows all students with Period 1–5 as columns; each cell is an editable dropdown (Present / Absent / OD / Informed Leave); no batch selector |
| FR-P8 | Every correction shall be saved in the Audit Log |
| FR-P9 | Principal shall have an **Attendance View** page: Year-wise table, students as rows, periods as columns; Batch is not a grouping column |
| FR-P10 | Principal shall have an **Audit Log** page: shows all their saved changes, filterable by date |
| FR-P11 | Principal shall approve batch groupings proposed by YC |
| FR-P12 | Principal shall set the attendance threshold (default 80%) |
| FR-P13 | Principal shall export reports (PDF/Excel) for any class/year/semester |
| FR-P14 | Principal shall **activate a semester** manually at the start of each academic term; only one semester is active at a time |

---

### 2.3 Year Co-ordinator Module

| ID | Requirement |
|---|---|
| FR-Y1 | YC shall see a **dashboard** (homepage) with attendance graphs, key stats, and quick actions for their year |
| FR-Y2 | YC shall have a **Student CRUD** page: add, view, edit, and remove students in their assigned year |
| FR-Y3 | YC shall assign students to a batch when adding or editing a student record |
| FR-Y4 | YC shall bulk-upload students via form/file |
| FR-Y5 | YC shall map Regular subjects to their year (triggers auto-enrollment) |
| FR-Y6 | YC shall manually enroll students in Elective (3rd year) and ELM (4th year) |
| FR-Y7 | YC shall pre-enter OD for **future days only** with a mandatory reason field |
| FR-Y8 | YC shall pre-enter Informed Leave for **future days only** |
| FR-Y9 | Pre-entered OD/IL shall lock the student's row in the staff's attendance table |
| FR-Y10 | YC shall **view, update, and cancel** existing OD/IL entries (future dates only, before staff submission) |
| FR-Y11 | YC shall view attendance year-wide — **no batch column**; students as rows, periods as columns |
| FR-Y12 | YC shall generate and export attendance reports for their year (PDF/Excel) |

---

### 2.4 Subject Staff Module

| ID | Requirement |
|---|---|
| FR-S1 | Staff shall navigate: **Year → Batch → Period → Fetch Students** |
| FR-S2 | **No subject-staff pre-assignment** — any staff can select any year/batch/period |
| FR-S3 | "Fetch Students" button shall return all students in that batch |
| FR-S4 | Attendance table: Roll No, Name, Status (Present/Absent — editable if unlocked), Remarks (read-only) |
| FR-S5 | Pre-locked rows (OD, Informed Leave) shall be visible but not editable |
| FR-S6 | Staff shall submit within 20 minutes of slot start (server-enforced) |
| FR-S7 | After submission, all unlocked Absent rows auto-set to Uninformed Leave |
| FR-S8 | Once submitted, staff cannot edit the attendance |

---

### 2.5 SMS Notification Module

| ID | Trigger | Rule |
|---|---|---|
| FR-SMS1 | Per-period alert | Sent immediately when a student is marked Absent (unlocked) |
| FR-SMS2 | Monthly warning | End of month if cumulative % < 80% — no exceptions |
| FR-SMS4 | OD/IL rows do not trigger per-period or daily SMS |
| FR-SMS5 | Templates defined in sms Gateway.md |
| FR-SMS6 | Every SMS (sent or failed) logged in Notification Log |

---

### 2.6 Attendance Calculation Module

| ID | Requirement |
|---|---|
| FR-C1 | `Attendance % = (Present + OD) / (Total Periods − Holidays) × 100` |
| FR-C2 | Lunch break (12:30–1:30 PM) never counted as a period |
| FR-C3 | College Holidays excluded from denominator |
| FR-C4 | Non-enabled Saturday = College Holiday |
| FR-C5 | Informed Leave = Absent (stays in denominator) |
| FR-C6 | Uninformed Leave = Absent (stays in denominator) |

---

## 3. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-1 | Performance | Attendance page load < 2 seconds |
| NFR-2 | Performance | SMS triggered within 30 seconds of submission |
| NFR-3 | Security | Passwords stored as bcrypt hashes |
| NFR-4 | Security | Role-based access enforced server-side on every API route |
| NFR-5 | Security | JWT tokens used for stateless auth; refresh tokens stored as HttpOnly cookies |
| NFR-6 | Availability | Available during college hours (7:00 AM – 6:00 PM) |
| NFR-7 | Data Integrity | Staff cannot submit attendance retroactively |
| NFR-8 | Audit | Every Principal edit → audit log entry |
| NFR-9 | Scalability | Up to 500 concurrent student records per year |
| NFR-10 | Compliance | SMS gateway DLT-registered (TRAI-compliant) |
| NFR-11 | Security | All DB queries use prepared statements (`mysql2`) — no SQL injection |

---

## 4. System Constraints
- No student or parent login portal
- Physical leave requests only
- Principal absence handling out of scope

## Links
- [[BRS]]
- [[attendance Donbosco]]
- [[Backend Architecture]]
- [[API Reference]]

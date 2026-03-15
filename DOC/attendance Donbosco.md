# Attendance System Documentation - Donbosco
**Agricultural Engineering College | Location: Uriyur**

## Core Requirements & Roles
1. [[Principal login|Principal]] - Admin and highest authority. Approves structure, fixes errors, views all reports.
2. [[Year Co-ordinator]] - Year-level management, bulk data entry, OD/Leave entry, maps electives & ELM.
3. [[Subject staff]] - Daily attendance entry (any year/batch/period — no pre-assignment).

## Core Domains & Rules
1. [[student database|Student Database Structure]] - Students, sections, batches, semesters.
2. [[Leave and Attendance Processing]] - Definitive leave types, calculation rules, and correction flow.
3. [[Timetable and Scheduling]] - Fixed daily schedule, sections, batches, lab staffing.
4. [[sms Gateway|SMS Notifications]] - Monthly parent warnings; Principal gate-keeps Informed Leave.
5. [[User Account Management]] - Login roles, OTP reset, Principal pre-seeded at deployment.

## Course Types
| Course Type | Year | Who Creates | Who Maps Students |
|---|---|---|---|
| Regular Subjects | All years | Principal (globally) | Year Co-ordinator |
| Elective Subjects | 3rd Year (optional) | Principal (globally) | Year Co-ordinator |
| ELM (Experiential Learning Module) | 4th Year (compulsory) | Principal (globally) | Year Co-ordinator |

> When the Principal selects any subject (regular, elective, or ELM), the system shows **all students enrolled in that subject** across all sections.

## Still Pending / On Hold
1. **What happens when the Principal is on leave?** — On hold. No deputy role defined yet.

## Main Attendance Formula
```
Attendance % = (Present + OD) / (Total Periods − College Holidays) × 100
```
- Informed Leave = **Absent** (does not boost %)
- College Holiday = **Excluded from denominator entirely**
- Monthly SMS to parents if `Attendance % < 80%`

## Project Documents
| # | Document | Purpose |
|---|---|---|
| 1 | [[BRS]] | Business requirements, goals, rules, and constraints |
| 2 | [[SRS]] | Full functional and non-functional requirements per module |
| 3 | [[System Design]] | Flow diagrams and sequence diagrams for every system event |
| 4 | [[Database Design]] | ER diagram and full table schema with data types |
| 5 | [[UI Design]] | Every screen layout, navigation, and field definitions |
| 6 | [[Architecture Design]] | Tech stack, component diagram, deployment, security |

## Links
- [[Requirements Audit]]
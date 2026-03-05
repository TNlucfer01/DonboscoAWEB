# Subject Staff
The teaching staff member who goes to a class to teach a specific subject.

## Login and Attendance Flow
1. **Login** with username and password.
2. **Select the Year** (1st, 2nd, 3rd, or 4th).
3. **Select the Batch** — Theory batch (A or B) or Lab batch (1–4).
4. **Select the Period** — Which timetable slot they're currently teaching.
5. **Click "Fetch Students"** — The system returns all students in that batch.
6. **Mark attendance** — For each student, the staff sets `Present` or `Absent`.
7. **Submit** — Within 20 minutes of the slot start time (server-enforced).

> **No pre-assignment required.** Any staff can select any year/batch/period and take attendance. The system does not enforce subject-to-staff mapping.

## Attendance Table (What the Staff Sees)

| Column | Content | Editable by Staff? |
|---|---|---|
| Roll No | Student roll number | ❌ Read-only |
| Name | Student name | ❌ Read-only |
| Status | `Present` / `Absent` / `OD` / `Informed Leave` | ✅ Only if row is **unlocked** |
| Remarks | Reason for OD or leave (pre-filled by YC) | ❌ Read-only |

### Locked Rows
- If the YC has pre-entered **OD** or **Informed Leave** for a student for that future day:
  - The row is **locked**.
  - Status shows `OD` (with reason) or `Informed Leave`.
  - Staff **cannot edit** the row.

## After Submission
1. All unlocked Absent students → parents receive **immediate SMS**.
2. **Monthly SMS** at end of month if cumulative % < 80%.

> Submission window: 20 minutes from the slot start time (server-side clock).

## Requesting a Correction
- Staff informs the **Year Co-ordinator** in person.
- YC escalates to the **Principal**.
- The **Principal** opens the attendance correction page and directly edits the record (can change past/future for any student).
- Every edit is logged in the **Audit Log**.

## Strict Rules
1. Submit within **20 minutes** of class start (server-enforced).
2. Once submitted, **cannot be changed** by the staff.
3. No subject-staff pre-assignment — staff freely selects year/batch/period.

## Links
- [[attendance Donbosco]]
- [[Leave and Attendance Processing]]
- [[Timetable and Scheduling]]

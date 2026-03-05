# Principal
The person who is the admin and highest authority in the system. All structural changes require Principal approval.

## Home Page (Dashboard)
The Principal lands on a college-wide dashboard (similar to YC but for the **entire college**):
- **Attendance graphs**: college-wide %, per-year %, per-batch %, trend over time.
- **Key stats**: total students across all years, total below 80%, recent corrections.
- **Quick actions**: Add Staff, Add Subject, Attendance Correction, Holiday Marking.

## Pages / Features

### 1. Add Staff Page
- Input: staff name, phone number, role (Year Co-ordinator or Subject Staff).
- Staff account is created with a default password.

### 2. Add Subject Page
- Input: subject name, **year** (1–4), description, **credits**, **department**, **semester** (Odd/Even).
- The subject is created globally; the Year Co-ordinator maps it to specific batches and enrolls students.

### 3. Holiday Marking Page
- **Calendar view** — select a date from a visual calendar.
- Enter **holiday name** and **description** (e.g., "Republic Day", "National Holiday").
- Only future dates can be marked as holidays.
- Once marked, the system blocks attendance submission for that day.
- Enabled Saturdays are also managed here.

### 4. Attendance Correction Page
- **Same layout as the staff attendance-taking page**, but the Principal can:
  - Select **any year / batch / period / date** (including past and future).
  - Change the status of any student to: `PRESENT`, `ABSENT`, `OD`, `INFORMED_LEAVE`.
  - For OD: a reason field is available.
- Every change is logged in the Audit Log.

### 5. Attendance View
- Same multi-view as the YC (by batch, by subject, by calendar+period, and attendance %) — but for the **entire college**, not just one year.
- Can drill down to any individual student.

### 6. Audit Log Page
- Shows all changes the Principal has made (attendance corrections).
- Columns: Timestamp, Student Name, Roll No, Subject, Date, Old Status, New Status.
- Filter by date range.
- Read-only — Principal can see what they have saved, but cannot undo from here.

### 7. Batch Approval
- YC proposes batch groupings → Principal approves or rejects.

### 8. Reports
- Export attendance reports for any class / year / semester (PDF/Excel).

### 9. Set Attendance Threshold
- Default: **80%**. Can be changed if policy updates.

## Audit Access
- The Principal is the **only user** who can view the Audit Log.

## Links
- [[attendance Donbosco]]
- [[student database]]
- [[User Account Management]]
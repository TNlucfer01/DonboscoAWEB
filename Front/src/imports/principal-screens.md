
## 2. Screen: Login

**Visible to**: All users

| Element | Details |
|---|---|
| College logo + name | Top center |
| Username field | Text input |
| Password field | Password input (masked) |
| Login button | Primary CTA |
| Forgot Password link | OTP reset flow |
| Error message | "Invalid credentials" (generic) |

### Forgot Password Flow
1. Enter registered phone number → OTP sent → Enter OTP → Set new password → Redirect to login.

---

## 3. Screen: Principal Dashboard (Homepage)

**Visible to**: Principal only

| Section               | Content                                                        |
| --------------------- | -------------------------------------------------------------- |
| **Attendance Graphs** | College-wide %, per-year %, per-batch %, trend chart           |
| **Key Stats Cards**   | Total students                                                 |
| **Side Bar**          | Add Staff, Add Subject, Holiday Marking, Attendance Correction |
| **Side Bar**          | Last 5 manual changes                                          |

---

## 4. Screen: Principal — Add Staff

| Element      | Details                               |
| ------------ | ------------------------------------- |
| email        |                                       |
| Phone Number | Text input                            |
| Staff Name   | Text input                            |
| Role         | Subject Staff                         |
| Save button  | Creates account with default password |

---

## 5. Screen: Principal — Add Subject

| Element      | Details                         |
| ------------ | ------------------------------- |
| Subject Name | Text input                      |
| subject code | Text input                      |
| Year         | Dropdown: 1st / 2nd / 3rd / 4th |
| Description  | Text area                       |
| Credits      | Number input                    |
| Semester     | Dropdown: Odd / Even            |
| Save button  | Creates subject globally        |

---

## 6. Screen: Principal — Holiday Marking

| Element                  | Details                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **Calendar View**        | Monthly calendar, colour-coded (Working = white, Holiday = red, Saturday enabled = green) |
| Select a date            | Click on any **future** date                                                              |
| Holiday Name             | Text input (e.g., "Republic Day")                                                         |
| Holiday Description      | Text area (e.g., "National Holiday")                                                      |
| Mark Holiday button      | Saves to College Calendar, blocks attendance for that day                                 |
| Enable Saturday button   | For Saturdays only — marks as working day                                                 |
| Cannot modify past dates | Past dates greyed out                                                                     |

---

## 7. Screen: Principal — Attendance Correction

**Same layout as the staff attendance page**, with extra powers:

| Element                 | Details                                                |
| ----------------------- | ------------------------------------------------------ |
| Year selector           | 1st / 2nd / 3rd / 4th                                  |
| Batch selector          | All batches for that year                              |
| Period selector         | 1–5                                                    |
| **Date picker**         | Can select **any date — past or future**               |
| Fetch Students button   | Returns all students in that batch                     |
| Attendance table        | Same columns as staff table, but **all rows editable** |
| Status dropdown per row | Present / Absent / OD / Informed Leave                 |
| OD Reason field         | Text — shown when OD selected                          |
| Save button             | Saves changes + triggers Audit Log entries             |


---

## 8. Screen: Principal — Attendance View

Same multi-view as YC (see below) but for the **entire college**, not just one year.

---

## 9. Screen: Principal — Audit Log


| Column           | Details                 |
| ---------------- | ----------------------- |
| Timestamp        | Date and time of change |
| Student          | Name + Roll No          |
| Date (of period) | Which date was changed  |
| Period           | Which slot              |
| Old Status       | Previous value          |
| New Status       | New value               |
| Changed By       | Always "Principal"      |

- Filter by date range
- Shows what the Principal has saved — read-only, no undo

---

## 10. Screen: YC Dashboard (Homepage)

**Visible to**: Year Co-ordinator (their year only)

| Section               | Content                                                                             |
| --------------------- | ----------------------------------------------------------------------------------- |
| **Attendance Graphs** | Year-wide %, per-batch %, trend chart                                               |
| **Key Stats Cards**   | Total students in year                                                              |
| **Quick Actions**     | Add Student, Enter OD/Leave, View Attendance(visible in sidebar so don't add them ) |


---

## 11. Screen: YC — Add Student
see the div lap

| Element          | Details                                              |
| ---------------- | ---------------------------------------------------- |
| Student Name     | Text input                                           |
| Roll Number      | Text input                                           |
| Parent Phone     | Text input                                           |
| **Batch Number** | Dropdown — assign the student to a batch immediately |
| Save button      | Adds student to the year                             |
|                  |                                                      |


---

## 12. Screen: YC — OD / Informed Leave Entry
see the divagaran lap for furture detials
table entry  (tittle DATE )
1. Sno
2. rollno 
3. name 
4. batch
5. 5 period attendance
6. remarks
7. Attendance  percentage 




## 13. Screen: YC — Attendance View (Multi-View)

table entry  (tittle DATE )
1. Sno
2. rollno 
3. name 
4. batch
5. 5 period attendance




---

## 14. Screen: Staff — Take Attendance
all Done
**Visible to**: Subject Staff

### Navigation Flow
| Step   | UI Element                                                 |
| ------ | ---------------------------------------------------------- |
| Step 1 | Year selector (radio: 1st / 2nd / 3rd / 4th)               |
| Step 2 | Batch selector (all batches — no pre-assignment filtering) |
| Step 3 | Period selector (1–5)                                      |
| step 4 | Subject selection                                          |
| Step 5 | **"Fetch Students" button**                                |
| Step 6 | Attendance table appears                                   |

##
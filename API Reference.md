# API Reference
**Project**: Donbosco Attendance System | **Version**: 1.0 | **Date**: 2026-03-05
**Base URL**: `http://localhost:3000/api`

> All protected routes require `Authorization: Bearer <access_token>` header.
> All responses follow `{ success: true, data: {...} }` or `{ success: false, error: {...} }`.

---

## Authentication

### `POST /api/auth/login` (needed )
Login with email and password.

**Body**
```json
{ "email": "principal@donbosco.ac.in", "password": "yourpassword" }
```
**Response** `200`
```json
{ "success": true, "data": { "token": "<JWT>", "role": "PRINCIPAL", "name": "Dr. XYZ" } }
```
Refresh token set as HttpOnly cookie.

---

### `POST /api/auth/refresh`(needed)


Get a new access token using the refresh cookie.

**Response** `200`
```json
{ "success": true, "data": { "token": "<new JWT>" } }
```

---

### `POST /api/auth/forgot-password`(needed)
Send OTP to registered phone number.

**Body**: `{ "phone": "9876543210" }`
**Response** `200`: `{ "success": true, "message": "OTP sent" }`

---

### `POST /api/auth/reset-password`(needed)
Verify OTP and set new password.

**Body**: `{ "phone": "9876543210", "otp": "123456", "newPassword": "newpass123" }`
**Response** `200`: `{ "success": true, "message": "Password updated" }`

---

### `POST /api/auth/logout`(needed)

Clear refresh token cookie.
**Response** `200`: `{ "success": true }`

---

## Users (Principal only)

### `GET /api/users`(needed)
 we need this 
Get all staff users.
**Query**: `?role=SUBJECT_STAFF` (optional filter)
**Response** `200`: `{ "success": true, "data": [ ...users ] }`

### `POST /api/users`(needed)
okay 
Create a new staff account (default password set).

**Body**
```json
{
  "name": "Mr. Rajan",
  "email": "rajan@donbosco.ac.in",
  "phone_number": "9876543211",
  "role": "SUBJECT_STAFF"
}
```
**Response** `201`: `{ "success": true, "data": { "user_id": 5 } }`

### `PUT /api/users/:id`(need)

Update staff details.
**Response** `200`: `{ "success": true, "data": updatedUser }`

### `DELETE /api/users/:id`(needed)

Deactivate a user account.
**Response** `200`: `{ "success": true }`

---

## Semesters (Principal)
when and who updates the semster is active or not?
for now i don't have any idea at all 
### `GET /api/semesters`
List all semesters.
**Response** `200`: `{ "success": true, "data": [...semesters] }`

### `POST /api/semesters/:id/activate`
Activate a semester (deactivates current active one).
**Response** `200`: `{ "success": true }`


---


## Subjects (Principal)

### `GET /api/subjects`
List all subjects.
**Query**: `?year=2&semester=ODD`
**Response** `200`: `{ "success": true, "data": [...subjects] }`

### `POST /api/subjects`
Create a subject.

**Body**
```json
{
  "subject_name": "Soil Science",
  "subject_code": "SS301",
  "subject_year": 3,
  "credits": 4,
  "semester": "ODD",
  "subject_description": "Introduction to soil"
}
```
**Response** `201`: `{ "success": true, "data": { "subject_id": 12 } }`

### `PUT /api/subjects/:id`
Update a subject.
**Response** `200`: `{ "success": true, "data": updatedSubject }
`
everythign is needed
## why is there is no delete here at all 

---

## Students (Year Coordinator)
needed
### `GET /api/students`
List students (YC sees own year only, Principal sees all).
**Query**: `?year=2&batch_id=3`

### `POST /api/students`
Add a new student.

**Body**
```json
{
  "name": "Arun Kumar",
  "roll_number": "21AG001",
  "parent_phone": "9876540001",
  "batch_id": 1,
  "current_year": 1
}
```
**Response** `201`: `{ "success": true, "data": { "student_id": 101 } }`

### `PUT /api/students/:id`
Update student details.

### `GET /api/students/:id`
Get single student with attendance summary.
needed for all 

---

## Student Enrollments (Year Coordinator)
 how yes we need to add this based on the student batch so its fron the frontend 
### `POST /api/enrollments/batch`
Enroll a student in a batch for the active semester.

**Body**: `{ "student_id": 101, "batch_id": 2, "semester_id": 3 }`
**Response** `201`: `{ "success": true }`



//why do we need the followwing two  endpoints 
### `POST /api/enrollments/subject`
Enroll a student in a subject.

**Body**: `{ "student_id": 101, "subject_id": 5, "semester_id": 3 }`
**Response** `201`: `{ "success": true }`

### `DELETE /api/enrollments/subject`
Remove a student from a subject.

---

## Attendance


isn't this supposed to be get 
### `POST /api/attendance/fetch-students`
Get student list for a batch+period+date. Checks holiday lock and marks OD/IL rows.

**Body**
```json
{
  "year": 1,
  "batch_id": 2,
  "slot_id": 3,
  "date": "2026-03-05",
  "subject_id": 7
}
```
**Response** `200`
```json
{
  "success": true,
  "data": {
    "window_open": true,
    "minutes_remaining": 18,
    "students": [
      { "student_id": 101, "roll_number": "21AG001", "name": "Arun", "is_locked": false, "status": "PRESENT" },
      { "student_id": 102, "roll_number": "21AG002", "name": "Priya", "is_locked": true, "status": "OD", "remarks": "Sports meet" }
    ]
  }
}
```

### `POST /api/attendance/submit`
Submit attendance records. Server validates 20-min window.
what is the diff btw the above and this 

**Body**
```json
{
  "batch_id": 2,
  "slot_id": 3,
  "date": "2026-03-05",
  "subject_id": 7,
  "semester_id": 1,
  "records": [
    { "student_id": 101, "status": "PRESENT" },
    { "student_id": 103, "status": "ABSENT" }
  ]
}
```
**Response** `201`
```json
{
  "success": true,
  "data": { "submitted": 2, "absent_sms_sent": 1 }
}
```

**Error** `422`
```json
{ "success": false, "error": { "code": "WINDOW_EXPIRED", "message": "Submission window has closed." } }
```

### `GET /api/attendance/my-submissions`
Staff: list of their past submissions.
**Query**: `?from=2026-03-01&to=2026-03-05`
no need 

---

## OD / Informed Leave (Year Coordinator)
needed 
### `POST /api/attendance/od-il`
Pre-enter OD or Informed Leave for a future date (locks the row).

**Body**
```json
{
  "student_id": 101,
  "date": "2026-03-10",
  "slot_id": 2,
  "status": "OD",
  "od_reason": "District Sports Meet",
  "semester_id": 1
}
```
**Response** `201`: `{ "success": true }`

---

## Attendance View (YC / Principal)
we only need the year  vise detials not  other view are need right now 
### `GET /api/attendance/view`

by year 

---

## Attendance Correction (Principal only)

### `PUT /api/attendance/correct`
Correct any attendance record. Creates an audit log entry.

**Body**
```json
{
  "record_id": 501,
  "new_status": "OD",
  "od_reason": "Official duty approved"
}
```
**Response** `200`: `{ "success": true, "data": { "audit_id": 78 } }`

---

## College Calendar (Principal)

### `GET /api/calendar`
Get calendar entries.
**Query**: `?month=3&year=2026`

### `POST /api/calendar/holiday`
Mark a future date as holiday.

**Body**
```json
{
  "date": "2026-03-15",
  "holiday_name": "Pongal Holiday Extension",
  "holiday_description": "College extension holiday"
}
```
**Response** `201`: `{ "success": true }`

### `POST /api/calendar/enable-saturday`
Mark a Saturday as a working day.
**Body**: `{ "date": "2026-03-21" }`

we need put  and delete too 

---

## Reports

### `GET /api/reports/attendance-summary`
Attendance percentage per student for the active semester.
**Query**: `?year=2&semester_id=1`

### `GET /api/reports/below-threshold`
Students with < 80% attendance.
**Query**: `?semester_id=1&threshold=80`

### `GET /api/reports/student/:id`
Full attendance history for a student.
**Query**: `?semester_id=1`

### `GET /api/reports/dashboard-principal`
College-wide summary stats for Principal dashboard.

### `GET /api/reports/dashboard-yc`
Year-level stats for Year Coordinator dashboard.
**Query**: `?year=2`

---

## Audit Log (Principal)

### `GET /api/audit`
Get audit log of all Principal corrections.
**Query**: `?from=2026-03-01&to=2026-03-31`

**Response** `200`
```json
{
  "success": true,
  "data": [
    {
      "audit_id": 1,
      "student_name": "Arun Kumar",
      "roll_number": "21AG001",
      "date": "2026-03-04",
      "slot_id": 2,
      "old_status": "ABSENT",
      "new_status": "OD",
      "changed_at": "2026-03-05T10:30:00Z"
    }
  ]
}
```

---

## Error Codes Reference

| Code                  | HTTP Status | Meaning                         |
| --------------------- | ----------- | ------------------------------- |
| `INVALID_CREDENTIALS` | 401         | Wrong email/password            |
| `TOKEN_EXPIRED`       | 401         | JWT expired                     |
| `FORBIDDEN`           | 403         | Role not allowed                |
| `VALIDATION_ERROR`    | 400         | Missing/invalid fields          |
| `WINDOW_EXPIRED`      | 422         | 20-min submission window closed |
| `HOLIDAY_BLOCKED`     | 422         | Attendance blocked (holiday)    |
| `DUPLICATE_ENTRY`     | 409         | Record already exists           |
| `NOT_FOUND`           | 404         | Resource not found              |
| `SERVER_ERROR`        | 500         | Unexpected server error         |

---

## Links
- [[Backend Architecture]]
- [[Backend Development Workflow]]
- [[Database Design]]

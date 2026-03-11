# API Reference
**Project**: Donbosco Attendance System | **Version**: 1.1 | **Date**: 2026-03-09
**Base URL**: `http://localhost:3000/api`

> All protected routes require `Authorization: Bearer <access_token>` header.
> All responses follow `{ success: true, data: {...} }` or `{ success: false, error: {...} }`.

---

## Authentication
*(No roles required)*

### `POST /api/auth/login`
Login with email and password.

**Body**
```json
{ "email": "principal@donbosco.ac.in", "password": "yourpassword" }
```
**Response** `200`
```json
{ "success": true, "data": { "token": "<JWT>", "role": "PRINCIPAL", "name": "Dr. XYZ", "id": 1 } }
```

### `POST /api/auth/refresh`
Get a new access token.

**Response** `200`
```json
{ "success": true, "data": { "token": "<new JWT>" } }
```

### `POST /api/auth/forgot-password`
Send OTP to registered phone number.

**Body**: `{ "phone": "9876543210" }`
**Response** `200`: `{ "success": true, "message": "OTP sent" }`

### `POST /api/auth/reset-password`
Verify OTP and set new password.

**Body**: `{ "phone": "9876543210", "otp": "123456", "newPassword": "newpass123" }`
**Response** `200`: `{ "success": true, "message": "Password updated" }`

### `POST /api/auth/logout`
Clear session/token.
**Response** `200`: `{ "success": true }`

---

## Users (Principal only)
*(Required Role: PRINCIPAL)*

### `GET /api/users`
Get all staff users.

### `GET /api/users/:id`
Get a specific user by ID.

### `POST /api/users`
Create a new staff account.

**Body**
```json
{
  "name": "Mr. Rajan",
  "email": "rajan@donbosco.ac.in",
  "phone_number": "9876543211",
  "role": "SUBJECT_STAFF"
}
```

### `PUT /api/users/:id`
Update staff details.

### `DELETE /api/users/:id`
Deactivate or remove a user account.

---

## Semesters

### `GET /api/semesters`
*(Required Roles: Any authenticated user)*
List all semesters.

### `PUT /api/semesters/:id/activate`
*(Required Role: PRINCIPAL)*
Activate a semester (deactivates the currently active one).

---

## Subjects

### `GET /api/subjects`
*(Required Roles: Any authenticated user)*
List all subjects.

### `GET /api/subjects/:id`
*(Required Roles: Any authenticated user)*
Get a typical subject by ID.

### `POST /api/subjects`
*(Required Role: PRINCIPAL)*
Create a subject.

**Body**
```json
{
  "subject_name": "Soil Science",
  "subject_year": 3,
  "credits": 4,
  "semester": "ODD"
}
```

### `PUT /api/subjects/:id`
*(Required Role: PRINCIPAL)*
Update a subject.

### `DELETE /api/subjects/:id`
*(Required Role: PRINCIPAL)*
Delete a subject.

---

## Batches

### `GET /api/batches`
*(Required Roles: Any authenticated user)*
List all batches.

### `GET /api/batches/:id`
*(Required Roles: Any authenticated user)*
Get a specific batch.

### `POST /api/batches`
*(Required Role: PRINCIPAL)*
Create a new batch.

**Body**
```json
{
  "name": "A",
  "batch_type": "THEORY",
  "year": 1,
  "capacity": 60
}
```

### `PUT /api/batches/:id`
*(Required Role: PRINCIPAL)*
Update batch details.

### `DELETE /api/batches/:id`
*(Required Role: PRINCIPAL)*
Delete a batch.

---

## Students

*(Required Roles: PRINCIPAL, YEAR_COORDINATOR)*

### `GET /api/students`
List all students. Validates based on year managed for Year Coordinators.

### `GET /api/students/:id`
Get a single student by ID.

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

### `PUT /api/students/:id`
Update student details.

### `DELETE /api/students/:id`
Remove a student.

### `POST /api/students/bulk`
Bulk import multiple students.
**Body**
```json
{
    "students": [ ... ],
    "current_year": 1,
    "batch_id": 1
}
```

---

## Attendance

### `POST /api/attendance/fetch-students`
*(Required Roles: PRINCIPAL, SUBJECT_STAFF)*
Get student list for a batch + period + date to mark attendance.

**Body**
```json
{
    "year": 1,
    "batch_id": 2,
    "slot_id": 3,
    "date": "2026-03-05"
}
```

### `POST /api/attendance/submit`
*(Required Roles: PRINCIPAL, SUBJECT_STAFF)*
Submit attendance records.

**Body**
```json
{
  "batch_id": 2,
  "slot_id": 3,
  "date": "2026-03-05",
  "semester_id": 1,
  "records": [
    { "student_id": 101, "status": "PRESENT" },
    { "student_id": 103, "status": "ABSENT" }
  ]
}
```

### `GET /api/attendance/view`
*(Required Roles: PRINCIPAL, YEAR_COORDINATOR)*
Get attendance data by year and date range.

### `PUT /api/attendance/correct`
*(Required Role: PRINCIPAL)*
Correct any attendance record (Creates an audit log entry).

---

## OD / Informed Leave

### `GET /api/attendance/od-il`
*(Required Roles: PRINCIPAL, YEAR_COORDINATOR)*
List all OD/IL entries.

### `POST /api/attendance/od-il`
*(Required Role: YEAR_COORDINATOR)*
Pre-enter OD or Informed Leave for a future date.

**Body**
```json
{
  "student_id": 101,
  "date": "2026-03-10",
  "slot_id": 2,
  "status": "OD",
  "semester_id": 1
}
```

### `PUT /api/attendance/od-il/:id`
*(Required Role: YEAR_COORDINATOR)*
Update an existing OD/IL entry.

### `DELETE /api/attendance/od-il/:id`
*(Required Role: YEAR_COORDINATOR)*
Cancel (remove) an OD/IL entry.

---

## College Calendar (Principal)
*(Required Role: PRINCIPAL)*

### `GET /api/calendar`
Get calendar entries.

### `POST /api/calendar`
Mark a future date as a holiday or enabled saturday.
**Body**
```json
{
  "date": "2026-03-15",
  "day_type": "HOLIDAY"
}
```

### `PUT /api/calendar/:id`
Update calendar entry limits or reasons.

### `DELETE /api/calendar/:id`
Remove a calendar entry.

---

## Reports

### `GET /api/reports/attendance-summary`
*(Required Roles: PRINCIPAL, YEAR_COORDINATOR)*
Filter by `semester_id`, `date_from`, `date_to`, `year` (for Principal).

### `GET /api/reports/below-threshold`
*(Required Roles: PRINCIPAL, YEAR_COORDINATOR)*
Students below the specified threshold. Filter by `semester_id`, `threshold` (default 80), `year`.

### `GET /api/reports/by-student/:id`
*(Required Roles: PRINCIPAL, YEAR_COORDINATOR)*
Full attendance history for a single student.

---

## Audit Log (Principal)

### `GET /api/audit`
*(Required Role: PRINCIPAL)*
Get audit log of all Principal corrections.
Filter by `date_from`, `date_to`.

---

## Error Codes Reference

| Code | HTTP Status | Meaning |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `TOKEN_EXPIRED` | 401 | JWT expired |
| `FORBIDDEN` | 403 | Role not allowed |
| `VALIDATION_ERROR` | 400 | Missing/invalid fields |
| `WINDOW_EXPIRED` | 422 | 20-min submission window closed |
| `HOLIDAY_BLOCKED` | 422 | Attendance blocked (holiday) |
| `DUPLICATE_ENTRY` | 409 | Record already exists |
| `NOT_FOUND` | 404 | Resource not found |
| `SERVER_ERROR` | 500 | Unexpected server error |

---

## Links
- [[Backend Architecture]]
- [[Backend Development Workflow]]
- [[Database Design]]
- [[UI Design]]

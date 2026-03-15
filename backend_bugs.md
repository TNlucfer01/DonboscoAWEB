# 🐛 Backend Bugs Report — Donbosco AMS

> Generated: 2026-03-15 | Audited every file in `Back/src/`

---

## 🔴 Critical Bugs

### 1. `cookie-parser` Missing — Refresh Tokens NEVER Work
**File:** [server.js](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/server.js)
**File:** [auth.controller.js](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/controllers/auth.controller.js#L28)

The `refresh` controller reads `req.cookies?.refreshToken` (line 28), but:
- `cookie-parser` is **not installed** (`npm ls cookie-parser` → not found)
- `cookie-parser` is **not in `package.json`** dependencies
- `app.use(cookieParser())` is **never called** in `server.js`

**Impact:** `req.cookies` is always `undefined`. Refresh tokens **never work**. When the access token expires (15 min), users are forcefully logged out with no way to silently refresh.

```diff
# Fix:
npm install cookie-parser
# In server.js:
+const cookieParser = require('cookie-parser');
+app.use(cookieParser());
```

---

### 2. Password Mismatch — Seeder vs. User Service
**File:** [seeders/index.js:36](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/seeders/index.js#L36) — Seeds `Admin@1234`
**File:** [user.service.js:31](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/services/user.service.js#L31) — Creates users with `Password@123`

The seeder creates the Principal with password `Admin@1234`, but when the Principal creates new staff/YC via the UI, the `user.service.create()` hardcodes `Password@123` as the default password. The Login page's demo credentials say `Admin@1234`.

**Verified:** The actual DB hash for the principal corresponds to `Password@123` (not `Admin@1234`), meaning the seeder was either run with a different password or the DB was reseeded. Either way, **the demo credentials shown in the frontend login page are wrong**.

---

### 3. Duplicate Database Connection — `sql.js` (Dead Code)
**File:** [config/sql.js](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/config/sql.js)

Creates a raw `mysql2` connection that is **never used anywhere** (confirmed via grep). This is dead code that wastes a database connection slot.

```diff
# Fix: Delete config/sql.js entirely
```

---

## 🟠 High Severity Bugs

### 4. Rate Limiter Too Aggressive for Development
**File:** [rateLimiter.js:6](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/middleware/rateLimiter.js#L6)

`max: 5` means only 5 login attempts per 15 minutes per IP. During testing, this gets triggered immediately by automated tests or even manual development testing. Confirmed during testing — got locked out after 5 attempts.

```diff
-max: 5,
+max: process.env.NODE_ENV === 'development' ? 100 : 5,
```

---

### 5. `is_locked: true` On Submit — Staff Can Modify After YC Lock
**File:** [attendance.service.js:127](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/services/attendance.service.js#L127)

In the `submit()` function, newly created records are **always** created with `is_locked: true`. This means even staff-submitted records become locked immediately, which defeats the purpose of the lock being a YC-only control for OD/IL.

The `correctStaffSubmit()` at line 320 similarly uses `is_locked: 1`.

```diff
# submit() should set is_locked: false for normal staff submissions
-is_locked: true,
+is_locked: false,
```

---

### 6. `fetchStudentsPrincipal` — No Data for Unsubmitted Periods
**File:** [attendance.service.js:542-694](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/services/attendance.service.js#L542)

This function only returns students who **already have attendance records** for that period. If staff hasn't submitted attendance yet for that slot, those students won't appear at all. The principal should see **all students** in that year, with empty status for unsubmitted slots.

---

### 7. `fetchStaffCorrectionStudents` — Filters `is_locked: false` Excludes Most Records
**File:** [attendance.service.js:202](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/services/attendance.service.js#L198-L203)

The function filters for `is_locked: false`, but since `submit()` sets `is_locked: true` on all new records (Bug #5), this query will return **NO records** in normal operation. Staff correction will always show an empty list.

---

### 8. `updateODIL` — Logic Inversion on Date Check
**File:** [attendance.service.js:511](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/services/attendance.service.js#L511)

```javascript
if (!dayjs(record.date).isAfter(dayjs(), 'day')) {
    throw new AppError('PAST_DATE', 'Cannot edit OD/IL for past dates', 400);
}
```

This throws on **today's date** as well as past dates (because today is NOT after today). Should use `isBefore`:

```diff
-if (!dayjs(record.date).isAfter(dayjs(), 'day')) {
+if (dayjs(record.date).isBefore(dayjs(), 'day')) {
```

---

### 9. `useODLeaveEntry` — Hardcoded `semester_id: 1`
**File:** [attendance.service.js:484](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/services/attendance.service.js#L484)

The `createODIL()` function takes `semester_id` from the frontend, but the frontend hook hardcodes it to `1`. This will fail once a different semester is activated.

---

## 🟡 Medium Severity Bugs

### 10. `fetchODLeaveStudents` API — Year Param Passed as Date String
**File:** [attendance.api.ts](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/api/attendance.api.ts#L225) → [attendance.routes.js:158](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/routes/attendance.routes.js#L158)

The frontend calls `fetchODLeaveStudents(format(d, 'yyyy-MM-dd'))` passing a **date string** as the "year" parameter. The backend route `GET /attendance/od-il` expects `req.query.year` to be `1-4`, not a date string. The backend `listODIL` function would then try to set `current_year` to `'2026-03-15'`, which is nonsensical.

---

### 11. `batch.service.getById` — `batch_id` Field Name Wrong
**File:** [batch.service.js:37-38](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/services/batch.service.js#L37-L38)

```javascript
const idKey = getBatchIdKey(type); // returns 'theory_batch_id' or 'lab_batch_id'
return { ...batch.toJSON(), batch_type: type, batch_id: batch[idKey] };
```

`getBatchIdKey` returns the **where clause key** (`theory_batch_id`), not the actual field. Since the PK is `theory_batch_id` / `lab_batch_id`, `batch[idKey]` works correctly by coincidence. But the function is confusing and could break if model field names change.

---

### 12. `attendance.routes.js` — Typo in Route Path
**File:** [attendance.routes.js:74](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/routes/attendance.routes.js#L74)

Route path is `/correct-attedance/fetch-students` — typo `attedance` instead of `attendance`. Same typo on line 99. This is live and must stay until the frontend typo is also fixed (both sides have the same typo, so it works — but it's technically incorrect).

---

### 13. `report.routes.js` — Raw SQL Has No Semester Scope
**File:** [report.routes.js:40-54](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/routes/report.routes.js#L40-L54)

The `attendance-summary` query doesn't filter by semester unless explicitly provided. This means a semester_id filter is always optional, and the summary aggregates all time. This could produce misleading percentages across multiple semesters.

---

### 14. No Validation on `save-student-pri` Route
**File:** [attendance.routes.js:44](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/routes/attendance.routes.js#L44)

The route has an empty validation array `[]` before `validate`. There's no body-level validation for the records array structure. A malformed request could crash the service.

---

### 15. `fetchStudents` — od_reason Overwritten Inconsistently
**File:** [attendance.service.js:59-60](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/services/attendance.service.js#L59-L60)

```javascript
if (status.toUpperCase() === 'PRESENT') od_reason = 'None';
else if (status.toUpperCase() === 'ABSENT') od_reason = 'uninformed_leave';
```

This overwrites `od_reason` from the database with hardcoded strings, even when a real OD reason exists. If a student has status='ABSENT' but a real reason, it gets replaced with `'uninformed_leave'`.

---

## 🔵 Low Severity / Code Quality

### 16. Debug `console.log` in Production Routes
**File:** [attendance.routes.js:23,89,90](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/routes/attendance.routes.js#L23)
**File:** [attendance.service.js:710](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/services/attendance.service.js#L710)

Multiple `console.log(req.body)` and `console.log(data)` calls left in production routes. These will log sensitive student data.

---

### 17. Massive Commented-Out Code in `attendance.service.js`
**File:** [attendance.service.js:542-694](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/services/attendance.service.js#L542-L694)

~100 lines of commented-out code (old pivot logic, raw SQL examples). Should be removed for clarity.

---

### 18. `sms.service.js` — OTP Logged to Console in Dev
**File:** [auth.service.js:62](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/services/auth.service.js#L62)

OTP is logged to console. If the NODE_ENV check is removed or misconfigured, OTPs would be logged in production.

---

### 19. In-Memory OTP Store — No Persistence
**File:** [auth.service.js:8](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/services/auth.service.js#L8)

The OTP store is a `Map()` in memory. Server restarts clear all pending OTPs, breaking password reset flows.

---

### 20. `winston` Dependency Unused
**File:** [package.json:32](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/package.json#L32)

`winston` is in dependencies but never imported anywhere. Dead dependency.

---

### 21. `fetchStaffCorrectionStudents` — Returns `success: true` Inside Data
**File:** [attendance.service.js:273](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/services/attendance.service.js#L273)

The service returns `{ success: true, ... }` but the route already wraps it in `success(res, data)` which produces `{ success: true, data: { success: true, ... } }`. The inner `success: true` is redundant and adds noise.

---

### 22. `save-student-pri` Route — Missing Semicolon After Route Handler
**File:** [attendance.routes.js:53](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/routes/attendance.routes.js#L53)

Missing semicolon after the `router.post('/save-student-pri', ...)` closing parenthesis (line 53). Works due to ASI but is inconsistent with the rest of the codebase.

---

### 23. `calendar.routes.js` / `calendar.service.js` — Missing `holiday_name` Validation
**File:** [calendar.routes.js:19-28](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/routes/calendar.routes.js#L19-L28)

The POST validation only checks `date` and `day_type`, but `holiday_name` and `holiday_description` are not validated. When creating a HOLIDAY, the name should be required.

---

### 24. `audit.routes.js` — Direct Model Queries Instead of Service
**File:** [audit.routes.js](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/routes/audit.routes.js)

The audit route directly queries Sequelize models instead of going through a service layer. This breaks the pattern used by every other route.

---

## Summary Table

| # | Severity | Bug | File |
|---|----------|-----|------|
| 1 | 🔴 Critical | cookie-parser missing – refresh tokens broken | server.js |
| 2 | 🔴 Critical | Password mismatch seeder vs user service | seeders/index.js, user.service.js |
| 3 | 🔴 Critical | Duplicate/dead DB connection (sql.js) | config/sql.js |
| 4 | 🟠 High | Rate limiter too aggressive (max: 5) | rateLimiter.js |
| 5 | 🟠 High | is_locked: true on submit (defeats YC lock) | attendance.service.js |
| 6 | 🟠 High | Principal view misses unsubmitted students | attendance.service.js |
| 7 | 🟠 High | Staff correction always empty (is_locked filter) | attendance.service.js |
| 8 | 🟠 High | updateODIL date check logic inversion | attendance.service.js |
| 9 | 🟠 High | Hardcoded semester_id: 1 in OD/IL | attendance.service.js |
| 10 | 🟡 Medium | OD/IL fetch passes date as "year" | attendance.api.ts → routes |
| 11 | 🟡 Medium | batch_id field name confusion | batch.service.js |
| 12 | 🟡 Medium | Typo in route path (`attedance`) | attendance.routes.js |
| 13 | 🟡 Medium | No semester scope in reports | report.routes.js |
| 14 | 🟡 Medium | No validation on save-student-pri | attendance.routes.js |
| 15 | 🟡 Medium | od_reason overwritten inconsistently | attendance.service.js |
| 16 | 🔵 Low | Debug console.log in prod routes | attendance.routes.js |
| 17 | 🔵 Low | ~100 lines commented-out code | attendance.service.js |
| 18 | 🔵 Low | OTP logged to console | auth.service.js |
| 19 | 🔵 Low | In-memory OTP store, no persistence | auth.service.js |
| 20 | 🔵 Low | winston unused dependency | package.json |
| 21 | 🔵 Low | Redundant `success: true` in service return | attendance.service.js |
| 22 | 🔵 Low | Missing semicolon after route handler | attendance.routes.js |
| 23 | 🔵 Low | Missing holiday_name validation | calendar.routes.js |
| 24 | 🔵 Low | Audit route bypasses service layer | audit.routes.js |

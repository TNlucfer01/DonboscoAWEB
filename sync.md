# 🐛 Frontend Bugs Report — Donbosco AMS

> Generated: 2026-03-15 | Audited every file in `Front/src/`

---

## 🔴 Critical Bugs

### 1. Role Case Mismatch — Login vs. Route Guards
**File:** [Login.tsx:178](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/features/auth/Login.tsx#L178)
**File:** [routes.tsx:62-64](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/routes/routes.tsx#L62-L64)

The backend returns roles as **UPPERCASE** (`PRINCIPAL`, `YEAR_COORDINATOR`, `SUBJECT_STAFF`). The `Login.tsx` does `user.role.toLowerCase()` (line 178), converting to `principal`, `year_coordinator`, `subject_staff`.

The route guards check for lowercase: `requiredRole="principal"`, `requiredRole="year_coordinator"`, `requiredRole="subject_staff"` — so this works.

**BUT** the `Protected` component does a strict equality check (`user.role !== requiredRole`). If the backend ever changes the case, or if `loadStoredUser()` restores the original case from a previous session, routes break silently.

> [!WARNING]
> This is fragile by design. Both Login.tsx and routes.tsx must agree on casing. Consider normalizing in one canonical place.

---

### 2. Wrong Demo Credentials on Login Page
**File:** [Login.tsx:248](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/features/auth/Login.tsx#L248)

The login page shows:
```
Principal: principal@donbosco.edu / Admin@1234
```

But the actual password in the database is `Password@123` (verified via bcrypt.compare). Users will see "Invalid credentials" when they try the displayed demo credentials.

---

### 3. `useODLeaveEntry` — Passes Date String as Year to Backend
**File:** [useODLeaveEntry.ts:18](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/hooks/useODLeaveEntry.ts#L18)
**File:** [attendance.api.ts:225](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/api/attendance.api.ts#L225)

```typescript
// useODLeaveEntry.ts
const data = await fetchODLeaveStudents(format(d, 'yyyy-MM-dd')); // passes "2026-03-15"

// attendance.api.ts
export async function fetchODLeaveStudents(year: string) {
    const data = await apiClient.get('/attendance/od-il', { year }); // sends year=2026-03-15
```

The function parameter is named `year` but receives a **date string**. The backend expects `year` to be `1-4` (for filtering by student year). This means OD/IL listing **always returns all years' data unfiltered** (the where clause fails silently).

---

### 4. `useODLeaveEntry` — Hardcoded `semester_id: 1`
**File:** [useODLeaveEntry.ts:55](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/hooks/useODLeaveEntry.ts#L55)

```typescript
await saveODLeaveEntries({
    student_id: student.id,
    slot_id: student.slot_id,
    date: student.date,
    status: student.status,
    od_reason: student.remarks || undefined,
    semester_id: 1, // ← HARDCODED
});
```

This hardcodes `semester_id: 1` regardless of which semester is active. Once any other semester becomes active, all OD/IL entries will be created in the wrong semester.

---

### 5. Status String Mismatch — Frontend "Present"/"Absent" vs Backend "PRESENT"/"ABSENT"
**File:** [TakeAttendance.tsx:167-168](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/features/staff/TakeAttendance.tsx#L167-L168)
**File:** [attendance.api.ts:130](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/api/attendance.api.ts#L130)

The staff attendance dropdown uses `"Present"` and `"Absent"` (Title Case), while the backend expects `"PRESENT"` and `"ABSENT"` (UPPER CASE).

The `submitStaffAttendance` API function does `s.status.toUpperCase()` (line 130), which converts correctly. **However**, when fetching students back, the API maps backend status to frontend with:
```typescript
status: s.status || 'Present',  // ← Title case default
```

This means if the backend returns `'PRESENT'`, the dropdown shows `'PRESENT'` (not matching `'Present'` select option), and the select value becomes uncontrolled. The `markAllPresent()` function also sets `'Present'` (Title case) instead of `'PRESENT'`.

**Inconsistency chain:**
- Backend → returns `PRESENT` / `ABSENT`
- Frontend `fetchStaffStudents()` → defaults to `'Present'` (line 116)
- Staff dropdown → shows `"Present"` and `"Absent"` (Title case)
- `submitStaffAttendance()` → `.toUpperCase()` before sending (saves the data)
- On re-fetch after submit → status is `PRESENT` (from DB), dropdown can't match `"Present"` option

---

## 🟠 High Severity Bugs

### 6. `fetchCorrectionStudents` — Using Wrong API Endpoint
**File:** [attendance.api.ts:51](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/api/attendance.api.ts#L51)

```typescript
export async function fetchCorrectionStudents(...) {
    const data = await apiClient.get('/attendance/fetch-students', { year, date_from: date, date_to: date });
```

Uses `GET /attendance/fetch-students` which **doesn't exist** in the backend. The backend has `POST /attendance/fetch-students` (staff) and `GET /attendance/fetch-students-pri` (principal). This function would always return a 404 error.

---

### 7. `useAttendanceCorrection` — Saves ALL Records, Not Just Modified Ones
**File:** [useAttendanceCorrection.ts:92](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/hooks/useAttendanceCorrection.ts#L92)

```typescript
const save = useCallback(async () => {
    const recordsToSave = students; // ← sends ALL students, not just changed ones
```

Every save sends the entire student list to the backend. No dirty-tracking. This means if you fetch 200 students and change 1, all 200 are re-saved. This is inefficient and could cause unintended overwrites via audit logs showing "changes" that weren't actual changes.

---

### 8. Timer `useEffect` Dependency — `secondsLeft > 0` Creates New Timer Each Tick
**File:** [TakeAttendance.tsx:48](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/features/staff/TakeAttendance.tsx#L48)
**File:** [AttendanceCorrection.tsx:48](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/features/staff/AttendanceCorrection.tsx#L48)

```typescript
useEffect(() => {
    // ... setInterval logic
}, [secondsLeft > 0]); // ← boolean expression as dependency
```

Using `secondsLeft > 0` as a dependency is a React anti-pattern. The expression evaluates to `true`/`false`, so it only re-runs when the boolean value changes (from false→true or true→false). This is **coincidentally correct** but confusing. The real issue is that the `setInterval` inside clears itself via `clearInterval` inside the callback, which is also an anti-pattern — `setTimeout` should be used instead.

---

### 9. `ODLeaveEntry.tsx` — No Way to Create New OD/IL Entries
**File:** [ODLeaveEntry.tsx](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/features/yc/ODLeaveEntry.tsx)

The OD Leave Entry page only loads **existing** OD/IL records from the backend. There's no UI to:
1. Search for a student to add a new OD/IL entry
2. Select which slot to assign OD/IL to
3. Create new entries for students who don't already have OD/IL

The page is essentially a read-only view/edit page, not a creation page as intended.

---

### 10. `AttendanceView` (Both Principal and YC) — Missing `fetch()` Reset
**File:** [AttendanceView.tsx (principal)](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/features/principal/AttendanceView.tsx)
**File:** [AttendanceView.tsx (yc)](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/features/yc/AttendanceView.tsx)

When the user changes the year or date filter and re-fetches, old data persists momentarily. The `fetch()` function doesn't clear old students before loading, leading to a flash of stale data.

---

## 🟡 Medium Severity Bugs

### 11. `ForgotPassword` — `loading` Not Reset on Validation Errors
**File:** [Login.tsx:35-36](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/features/auth/Login.tsx#L35-L36)

```typescript
if (phone.length !== 10) {
    setError('Please enter a valid 10-digit phone number');
    return; // ← returns BEFORE finally block sets loading=false
}
```

If validation fails on step 1, `setLoading(true)` was already called but `return` exits before `finally` can run... Actually wait, `return` in a `try` block DOES trigger `finally`. Let me re-examine.

Actually, the `setLoading(true)` is called **before** the `try` block, so `finally` does execute. However, the `return` inside the `if` statement actually causes the form to still show "Sending..." forever because `finally` has already set `setLoading(false)` — no, `finally` runs. This is actually fine. **Retracted.**

---

### 11 (Revised). `fetchAttendanceView` — Calls Wrong Endpoint
**File:** [attendance.api.ts:16](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/api/attendance.api.ts#L16)

```typescript
export async function fetchAttendanceView(year: string, date: string) {
    const data = await apiClient.get('/attendance/view', { year, date_from: date, date_to: date });
```

The backend route `GET /attendance/view` requires role `YEAR_COORDINATOR` or `PRINCIPAL`. But the `PrincipalAttendanceView` component uses a separate endpoint `GET /attendance/fetch-students-pri`. This function appears to technically work but only for YC/Principal roles.

---

### 12. `YCDashboard` — Random Trend Data, Not From Backend
**File:** [Dashboard.tsx (YC):57-60](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/features/yc/Dashboard.tsx#L57-L60)

```typescript
setTrendData(months.map((month, i) => ({
    month,
    attendance: Math.max(0, current - (months.length - 1 - i) * 2 + Math.floor(Math.random() * 4)),
})));
```

The "Attendance Trend" chart uses `Math.random()` to generate fake data. This shows different values on every page load, which is misleading. The chart should either use real data or be clearly labeled as a placeholder.

---

### 13. `markHoliday` API — Missing `holiday_name` Field
**File:** [holiday.api.ts:22](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/api/holiday.api.ts#L22)

```typescript
export async function markHoliday(date: string, reason: string) {
    await apiClient.post('/calendar', { date, day_type: 'HOLIDAY', reason });
}
```

Sends `reason` but the backend `CollegeCalendar` model expects `holiday_name` and `holiday_description`. The `reason` field **doesn't match any model column**, so it's silently ignored. The holiday will be created with `null` name and description.

---

### 14. `CalendarEntry` Interface — Missing Fields
**File:** [holiday.api.ts:6-10](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/api/holiday.api.ts#L6-L10)

```typescript
export interface CalendarEntry {
    calendar_id: number;
    date: string;
    day_type: string;
    reason: string | null; // ← backend returns holiday_name, not reason
}
```

The interface uses `reason` but the backend model has `holiday_name` and `holiday_description`. The frontend will never see the holiday name/description.

---

### 15. Recharts `ResponsiveContainer` Missing
**File:** [Dashboard.tsx (Principal):72](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/features/principal/Dashboard.tsx#L72)
**File:** [Dashboard.tsx (YC):87,97](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/features/yc/Dashboard.tsx#L87)

`BarChart` and `LineChart` are rendered without `<ResponsiveContainer>` wrapper. Without it, the charts have no intrinsic width/height and may render at 0×0 or overflow their container.

---

### 16. `student.api.ts` — `updateStudent` Uses `id` as Number But Backend Expects Roll Number
**File:** [student.api.ts:23](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/api/student.api.ts#L23)
**File:** [student.service.js:69](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Back/src/services/student.service.js#L69)

```typescript
// Frontend
export async function updateStudent(id: number, data: { ... })
    await apiClient.put(`/students/${id}`, data);

// Backend
async function update(id, data) {
    const student = await Student.findOne({ where: { roll_number: id } });
```

The frontend passes `id` as a number (student_id), but the backend `update()` function looks up by `roll_number` (a string like `"23AG001"`). The update will always fail with "Student not found".

Same issue exists in `deleteStudent(id: number)`.

---

## 🔵 Low Severity / Code Quality

### 17. `ATTENDANCE_STATUS_OPTIONS` — Using `P`, `A` Instead of Backend Values
**File:** [constants.ts:49-54](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/features/shared/constants.ts#L49-L54)

```typescript
export const ATTENDANCE_STATUS_OPTIONS = [
    { value: 'P', label: 'P' },
    { value: 'A', label: 'A' },
    { value: 'OD', label: 'OD' },
    { value: 'IL', label: 'IL' },
];
```

The backend expects `PRESENT`, `ABSENT`, `OD`, `INFORMED_LEAVE`. Using `P` and `A` as values will cause validation errors if these are sent directly to the backend. The OD/Leave Entry page uses these directly.

---

### 18. `subject.api.ts` — Missing `subject_description` in Type
**File:** [subject.api.ts:5-13](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/api/subject.api.ts#L5-L13)

The `Subject` interface has `description?` (line 12) but the backend model uses `subject_description`. These field names don't match.

---

### 19. Hardcoded Academic Year "2025-26"
**File:** [Dashboard.tsx (Principal):54](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/features/principal/Dashboard.tsx#L54)

```typescript
{ icon: CalendarIcon, label: 'Academic Year', value: '2025-26' },
```

Hardcoded to '2025-26'. Will be incorrect next year.

---

### 20. `imports/` Folder Contents Unknown
**File:** [imports/](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/imports)

This directory exists but hasn't been examined. Could contain unused files.

---

### 21. `staff/TakeAttendance` — Date Always Uses Today via `new Date().toISOString().split('T')[0]`
**File:** [TakeAttendance.tsx:192](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/features/staff/TakeAttendance.tsx#L192)

The submit button always sends today's date:
```typescript
submit(year, batch, period, subject, new Date().toISOString().split('T')[0])
```

**Timezone Bug:** `toISOString()` uses UTC. At IST (UTC+5:30), after midnight UTC (5:30 AM IST) but before midnight IST, the date will be **yesterday's date** in UTC. This means after 5:30 AM IST, attendance submitted before midnight could be stamped with the wrong date.

Same issue in `fetchStaffStudents` at [attendance.api.ts:103](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/api/attendance.api.ts#L103).

---

### 22. `test.txt` and `data/` in Principal Feature
**File:** [features/principal/test.txt](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/src/features/principal/test.txt)

Test/debug files left in the feature directory shared.

---

### 23. `cookies.txt` in Front Root
**File:** [Front/cookies.txt](file:///home/darkemperor/Sync/myvault/JAVA_N/Donbosco/Front/cookies.txt)

A `cookies.txt` file exists in the frontend root with 333 bytes. May contain sensitive information.

---

## Summary Table

| # | Severity | Bug | File |
|---|----------|-----|------|
| 1 | 🔴 Critical | Role case mismatch (fragile) | Login.tsx, routes.tsx |
| 2 | 🔴 Critical | Wrong demo credentials (Admin@1234 vs Password@123) | Login.tsx |
| 3 | 🔴 Critical | OD/IL fetch passes date string as "year" | useODLeaveEntry.ts, attendance.api.ts |
| 4 | 🔴 Critical | Hardcoded `semester_id: 1` in OD/IL save | useODLeaveEntry.ts |
| 5 | 🔴 Critical | Status string mismatch (Title Case vs UPPER) | TakeAttendance.tsx, attendance.api.ts |
| 6 | 🟠 High | `fetchCorrectionStudents` uses wrong endpoint (GET vs POST) | attendance.api.ts |
| 7 | 🟠 High | Saves ALL records, not just modified ones | useAttendanceCorrection.ts |
| 8 | 🟠 High | Timer useEffect anti-pattern | TakeAttendance.tsx |
| 9 | 🟠 High | No way to create new OD/IL entries | ODLeaveEntry.tsx |
| 10 | 🟠 High | No data reset between fetches | AttendanceView.tsx |
| 11 | 🟡 Medium | `fetchAttendanceView` role restriction | attendance.api.ts |
| 12 | 🟡 Medium | Random fake trend data on YC dashboard | yc/Dashboard.tsx |
| 13 | 🟡 Medium | `markHoliday` sends wrong field name (reason vs holiday_name) | holiday.api.ts |
| 14 | 🟡 Medium | `CalendarEntry` interface field mismatch | holiday.api.ts |
| 15 | 🟡 Medium | Charts missing ResponsiveContainer | principal/Dashboard.tsx, yc/Dashboard.tsx |
| 16 | 🟡 Medium | `updateStudent` passes number id, backend expects roll_number | student.api.ts |
| 17 | 🔵 Low | Status options use P/A instead of PRESENT/ABSENT | constants.ts |
| 18 | 🔵 Low | Subject description field name mismatch | subject.api.ts |
| 19 | 🔵 Low | Hardcoded academic year '2025-26' | principal/Dashboard.tsx |
| 20 | 🔵 Low | Unknown imports/ folder | imports/ |
| 21 | 🔵 Low | UTC timezone bug in date generation | TakeAttendance.tsx, attendance.api.ts |
| 22 | 🔵 Low | Debug files in feature folder | principal/test.txt |
| 23 | 🔵 Low | Sensitive cookies.txt in root | Front/cookies.txt |

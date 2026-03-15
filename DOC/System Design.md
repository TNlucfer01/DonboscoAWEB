# System Design
**Project**: Donbosco Attendance System | **Version**: 5.0 (Node.js) | **Date**: 2026-03-05

> Reflects latest changes: no daily SMS, simplified Users, restructured Subjects. Backend migrated to Node.js + Express.js.

---

## 1. Roles and Their Scope

```mermaid
graph TD
    SYS["🏫 Donbosco Attendance System"]
    SYS --> P["👨‍💼 Principal\n(1 account — pre-seeded)"]
    SYS --> YC["📋 Year Co-ordinator\n(1 per year × 4 = 4 accounts)"]
    SYS --> SS["👨‍🏫 Subject Staff\n(No pre-assignment)"]

    P --> P1["Dashboard — college-wide graphs"]
    P --> P2["Add Staff (name, phone, role)"]
    P --> P3["Add Subject (name, year, credits, semester)"]
    P --> P4["Holiday Marking (calendar + name + desc)"]
    P --> P5["Attendance Correction\n(any date — can set Present/Absent/OD/IL)"]
    P --> P6["Attendance View (all years)"]
    P --> P7["Audit Log"]

    YC --> YC1["Dashboard — year graphs + stats"]
    YC --> YC2["Add Students (details + batch no)"]
    YC --> YC3["Map subjects + enroll students"]
    YC --> YC4["Pre-enter OD/IL (future days only)"]
    YC --> YC5["Multi-view attendance + % report"]

    SS --> SS1["Year → Batch → Period → Fetch → Mark"]
    SS --> SS2["Submit within 20 min"]
```

---

## 2. Batch Structure

```mermaid
graph TD
    YEAR["1 Year\n~100 Students"]
    YEAR --> TA["Theory Batch A\n(50 students)"]
    YEAR --> TB["Theory Batch B\n(50 students)"]
    TA --> L1["Lab Batch 1 (25)"]
    TA --> L2["Lab Batch 2 (25)"]
    TB --> L3["Lab Batch 3 (25)"]
    TB --> L4["Lab Batch 4 (25)"]
```

---

## 3. Event: Staff Takes Attendance

```mermaid
sequenceDiagram
    actor Staff as 👨‍🏫 Subject Staff
    participant App as Node.js/Express
    participant DB as MySQL
    participant SMS as SMS Gateway

    Staff->>App: Login
    Staff->>App: Select Year → Batch → Period
    Staff->>App: Click "Fetch Students"
    App->>DB: Get all students in that batch
    App->>Staff: Attendance table (locked OD/IL rows shown)
    Staff->>App: Mark Present/Absent → Submit
    App->>App: ⏱ Server checks: within 20 min?

    alt Within window
        App->>DB: Save PRESENT / ABSENT records
        App->>SMS: Immediate SMS for each ABSENT (unlocked)
        App->>Staff: ✅ Submitted
    else Window expired
        App->>Staff: ❌ Closed — contact YC
    end
```

---

## 4. Event: YC Pre-enters OD / Informed Leave

```mermaid
flowchart TD
    A["🎓 Student needs OD / Leave"] --> B["Student gets physical form\nsigned by YC"]
    B --> C["YC checks student attendance %"]
    C --> D{"% ≥ 80%? (for IL)"}
    D -- YES --> E["Principal signs form"]
    D -- NO --> F["❌ Principal declines\nStays Absent → SMS sent"]
    E --> G["YC enters in system\n(future date only):\nOD with reason, or IL"]
    G --> H["Row LOCKED in\nstaff attendance table"]
```

---

## 5. Event: Principal Corrects Attendance

```mermaid
sequenceDiagram
    actor Staff as 👨‍🏫 Subject Staff
    actor YC as 📋 Year Co-ordinator
    actor Principal as 👨‍💼 Principal
    participant App as System
    participant Audit as Audit Log

    Staff->>YC: Reports mistake
    YC->>Principal: Escalates
    Principal->>App: Opens Attendance Correction page
    Note over Principal,App: Same layout as staff page<br/>but can pick ANY date (past/future)<br/>and set: Present, Absent, OD, IL
    Principal->>App: Selects Year → Batch → Period → Date
    App->>Principal: Student list for that batch/date
    Principal->>App: Changes status
    App->>Audit: Logs: who, old status, new status, when
    App->>Principal: ✅ Saved
```

---

## 6. Event: Principal Marks Holiday

```mermaid
flowchart TD
    P["👨‍💼 Principal"] --> CAL["Opens Holiday Marking page\n(Calendar view)"]
    CAL --> SEL["Selects a future date"]
    SEL --> FORM["Enters Holiday Name\n+ Description"]
    FORM --> SAVE["System saves to College Calendar"]
    SAVE --> BLOCK["⛔ System blocks all attendance\nsubmission for that date"]
```

---

## 7. Event: SMS Notification Flow

```mermaid
flowchart TD
    SUBMIT["Staff submits attendance"] --> AUTO["Absent students\n(unlocked rows)"]
    AUTO --> SMS1["📱 Immediate SMS per period\nto parent"]

    MONTH_END["📅 End of month"] --> CHECK_MONTHLY{"Cumulative % < 80%?"}
    CHECK_MONTHLY -- YES --> SMS3["📱 Monthly Warning SMS"]
    CHECK_MONTHLY -- NO --> SKIP2["No monthly SMS"]
```

> ❌ Daily Summary SMS removed.

---

## 8. Event: Attendance % Calculation

```mermaid
flowchart LR
    TOTAL["All Slots in Semester"]
    TOTAL --> H{"Holiday or\nnon-enabled Saturday?"}
    H -- YES --> EX["❌ Excluded"]
    H -- NO --> S{"Student status?"}
    S -- Present --> P["✅ +1 num, +1 den"]
    S -- OD --> O["✅ +1 num, +1 den"]
    S -- Informed Leave --> IL["❌ +0 num, +1 den"]
    S -- Absent --> AB["❌ +0 num, +1 den"]
    P & O & IL & AB --> F["📊 % = num / den × 100"]
```

---

## 9. Event: Semester Setup (future feature)

> This setup flow can be added in later iterations.

```mermaid
flowchart TD
    A["📅 New Semester"] --> B["Principal creates Semester record"]
    B --> C["Principal adds subjects\n(name, year, credits, semester)"]
    C --> D["YC adds students\n(details + batch number)"]
    D --> E["YC maps subjects to year"]
    E --> F["✅ Ready for attendance"]
```

---

## 10. YC Multi-View Attendance

```mermaid
flowchart TD
    YC["📋 YC opens Attendance View"] --> MODE{"Select view mode"}
    MODE --> V1["By Batch\nSelect batch → All students summary"]
    MODE --> V2["By Subject\nSelect subject → Total hours + attendance"]
    MODE --> V3["By Calendar + Period\nSelect date → Select period → See records"]
    MODE --> V4["Attendance %\nAll students ranked by %"]
```

---

## 11. Database Summary (Entity Map)

```mermaid
graph LR
    U[Users] --> AR[Attendance Records]
    S[Students] --> SBE[Student Batch Enrollment]
    B[Batches] --> SBE
    SEM[Semesters] --> SBE
    S --> SSE[Student Subject Enrollment]
    SUB --> SSE
    SEM --> SSE
    S --> AR
    SEM --> AR
    TS[Timetable Slots] --> AR
    AR --> AAL[Attendance Audit Log]
    U --> AAL
    S --> NL[Notification Log]
    SEM --> NL
    U --> CC[College Calendar]
```

## Links
- [[attendance Donbosco]]
- [[BRS]]
- [[SRS]]
- [[Database Design]]
- [[Architecture Design]]
- [[Backend Architecture]]
- [[API Reference]]

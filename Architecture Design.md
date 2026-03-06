# Architecture Design
**Project**: Donbosco Attendance System | **Version**: 3.0 (Node.js) | **Date**: 2026-03-05

> Updated v3.0: Migrated from Spring Boot to Node.js + Express.js backend. Removed subject-staff mapping.

---

## 1. Architecture Overview

```mermaid
graph TD
    subgraph Client["Client Tier (Browser)"]
        WEB["Web Browser\n(Chrome, Firefox, Mobile)"]
    end

    subgraph App["Application Tier (Node.js Server)"]
        ROUTER["Express Routers"]
        MW["Middleware\n(JWT Auth + Role Guard)"]
        CTRL["Controllers"]
        SVC["Service Layer"]
        SCHED["Scheduled Jobs\n(node-cron — SMS triggers)"]
    end

    subgraph Data["Data Tier"]
        DB["MySQL Database\n(mysql2 prepared stmts)"]
    end

    subgraph External["External Services"]
        SMS_API["SMS Gateway API\n(MSG91 / Twilio)"]
    end

    WEB -->|HTTPS / REST JSON| ROUTER
    ROUTER --> MW
    MW --> CTRL
    CTRL --> SVC
    SVC --> DB
    SCHED --> SVC
    SVC --> SMS_API
    SMS_API -->|SMS| PARENT["📱 Parent Phone"]
```

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML + Vanilla JS + CSS (served separately) |
| **Runtime** | Node.js v20 LTS |
| **Framework** | Express.js v5 |
| **Auth / Security** | JWT (`jsonwebtoken`) + `bcryptjs` + `helmet` |
| **Database Driver** | `mysql2` (promise-based, prepared statements) |
| **Database** | MySQL 8 |
| **Validation** | `express-validator` |
| **SMS** | MSG91 REST API via `axios` |
| **Scheduler** | `node-cron` |
| **Process Manager** | PM2 (production) / nodemon (dev) |
| **Deployment** | Linux VPS or on-premise (Nginx + PM2) |

---

## 3. Component Architecture

```mermaid
graph LR
    subgraph Routes["Express Routes"]
        AUTH_R["auth.routes.js"]
        ATT_R["attendance.routes.js"]
        STUDENT_R["student.routes.js"]
        REPORT_R["report.routes.js"]
        USER_R["user.routes.js"]
        CAL_R["calendar.routes.js"]
    end

    subgraph Controllers["Controllers"]
        AUTH_C["auth.controller.js"]
        ATT_C["attendance.controller.js"]
        STUDENT_C["student.controller.js"]
        REPORT_C["report.controller.js"]
        USER_C["user.controller.js"]
        CAL_C["calendar.controller.js"]
    end

    subgraph Services["Services"]
        AUTH_SVC["auth.service.js\n(JWT, OTP, bcrypt)"]
        ATT_SVC["attendance.service.js\n(submit, lock, 20-min window)"]
        STUDENT_SVC["student.service.js"]
        REPORT_SVC["report.service.js\n(%, summaries)"]
        SMS_SVC["sms.service.js\n(per-period, monthly)"]
        CALENDAR_SVC["calendar.service.js"]
    end

    subgraph Middleware["Middleware"]
        AUTH_MW["auth.js\n(JWT verify)"]
        ROLE_MW["roleGuard.js\n(RBAC)"]
        VAL_MW["validate.js\n(express-validator)"]
    end

    Routes --> Middleware
    Middleware --> Controllers
    Controllers --> Services
    Services -->|mysql2| DB["MySQL"]
    SMS_SVC -->|axios| MSG91["MSG91 API"]
```

> **No ORM**: Raw SQL via `mysql2` prepared statements. No subject-staff mapping.

---

## 4. Security Architecture

| Role | Access Scope |
|---|---|
| `PRINCIPAL` | All pages — dashboard, add staff/subject, holiday, correction, view, audit |
| `YEAR_COORDINATOR` | Own year — dashboard, add student, OD/IL, attendance view, reports |
| `SUBJECT_STAFF` | Attendance page only — select any year/batch/period, submit |

- **Authentication**: Username + password (bcrypt). Session-based.
- **Password Reset**: OTP via SMS. Self-service.
- **Server-enforced**: 20-min window, holiday lock, role access.

---

## 5. Scheduled Jobs

| Job | Schedule | Description |
|---|---|---|
| `MonthlyWarningJob` | Last day of month, 11:00 PM | Check cumulative %. Send SMS if < 80% |

---

## 6. Deployment Diagram

```mermaid
graph TB
    CLIENT["👨 Staff / Principal / YC\n(Browser)"]

    subgraph Server["College Server / VPS (Linux)"]
        NGINX["Nginx\n(Port 443 — reverse proxy + SSL)"]
        NODE["Node.js App\n(PM2 — Port 3000)"]
        MYSQL["MySQL\n(Port 3306)"]
    end

    subgraph Cloud["External"]
        MSG91["MSG91 SMS Gateway"]
    end

    CLIENT -->|HTTPS| NGINX
    NGINX -->|Proxy| NODE
    NODE <-->|mysql2| MYSQL
    NODE -->|REST| MSG91
    MSG91 -->|SMS| PHONES["📱 Parents"]
```

---

## 7. Data Flow: Staff Takes Attendance

```mermaid
sequenceDiagram
    actor Staff as 👨‍🏫 Subject Staff
    participant App as Node.js/Express
    participant DB as MySQL
    participant SMS as MSG91

    Staff->>App: POST /api/auth/login
    App->>DB: SELECT user WHERE email = ?
    App-->>Staff: JWT access token
    Staff->>App: POST /api/attendance/fetch-students (Bearer token)
    App->>App: auth.js — jwt.verify(token)
    App->>App: roleGuard.js — check SUBJECT_STAFF
    App->>DB: Get students in batch + OD/IL locks
    App-->>Staff: Student list (locked rows flagged)
    Staff->>App: POST /api/attendance/submit
    App->>App: Check: now − slot_start ≤ 20 min?
    App->>DB: INSERT attendance_records (bulk, prepared stmt)
    App->>SMS: axios.post(MSG91) for each ABSENT
    App-->>Staff: 201 { submitted: N, absent_sms_sent: M }
```

## Links
- [[attendance Donbosco]]
- [[BRS]]
- [[Backend Architecture]]
- [[Backend Development Workflow]]
- [[API Reference]]

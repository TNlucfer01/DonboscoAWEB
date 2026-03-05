# Architecture Design
**Project**: Donbosco Attendance System | **Version**: 2.0 (Updated) | **Date**: 2026-03-03

> Updated: removed subject-staff mapping from all components and services.

---

## 1. Architecture Overview

```mermaid
graph TD
    subgraph Client["Client Tier (Browser)"]
        WEB["Web Browser\n(Chrome, Firefox, Mobile)"]
    end

    subgraph App["Application Tier (Spring Boot Server)"]
        CTRL["REST Controllers"]
        SVC["Service Layer"]
        SEC["Spring Security\n(Role-based Access)"]
        SCHED["Scheduled Jobs\n(SMS triggers)"]
    end

    subgraph Data["Data Tier"]
        DB["MySQL Database"]
    end

    subgraph External["External Services"]
        SMS_API["SMS Gateway API\n(MSG91 / Twilio)"]
    end

    WEB -->|HTTPS| CTRL
    CTRL --> SEC
    SEC --> SVC
    SVC --> DB
    SCHED --> SVC
    SVC --> SMS_API
    SMS_API -->|SMS| PARENT["📱 Parent Phone"]
```

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Thymeleaf (server-rendered) + Bootstrap 5 |
| **Backend** | Java 17 + Spring Boot 3 |
| **Security** | Spring Security (session-based + role RBAC) |
| **ORM** | Spring Data JPA + Hibernate |
| **Database** | MySQL 8 |
| **SMS** | MSG91 API (DLT compliant) |
| **Build** | Maven |
| **Server** | Embedded Tomcat |
| **Deployment** | Single server (Linux VPS or on-premise) |

---

## 3. Component Architecture

```mermaid
graph LR
    subgraph Controllers
        AUTH["AuthController"]
        ATT["AttendanceController"]
        STUDENT["StudentController"]
        REPORT["ReportController"]
        ADMIN["AdminController\n(add staff, add subject)"]
        CAL["CalendarController\n(holiday marking)"]
    end

    subgraph Services
        AUTH_SVC["AuthService\n(OTP, password reset)"]
        ATT_SVC["AttendanceService\n(submit, lock check,\nfetch by batch/period)"]
        STUDENT_SVC["StudentService\n(add with batch no)"]
        REPORT_SVC["ReportService\n(PDF, Excel, multi-view)"]
        SMS_SVC["SMSService\n(per-period, daily, monthly)"]
        AUDIT_SVC["AuditService"]
        ENROLL_SVC["EnrollmentService\n(auto + manual)"]
        CALENDAR_SVC["CalendarService\n(holiday name + desc)"]
    end

    subgraph Repositories
        USER_REPO["UserRepository"]
        STUDENT_REPO["StudentRepository"]
        ATT_REPO["AttendanceRepository"]
        BATCH_REPO["BatchRepository"]
        SUBJECT_REPO["SubjectRepository"]
        NOTIF_REPO["NotificationRepository"]
        AUDIT_REPO["AuditRepository"]
        SEM_REPO["SemesterRepository"]
        CAL_REPO["CalendarRepository"]
    end

    Controllers --> Services
    Services --> Repositories
    SMS_SVC -->|External| MSG91["MSG91 API"]
```

> **Removed**: `AssignmentService` and `AssignmentRepository` — no subject-staff mapping needed.

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

    subgraph Server["College Server / VPS"]
        TOMCAT["Spring Boot App\n(Port 8080)"]
        MYSQL["MySQL\n(Port 3306)"]
    end

    subgraph Cloud["External"]
        MSG91["MSG91 SMS Gateway"]
    end

    CLIENT -->|HTTPS| TOMCAT
    TOMCAT <-->|JDBC| MYSQL
    TOMCAT -->|REST| MSG91
    MSG91 -->|SMS| PHONES["📱 Parents"]
```

---

## 7. Data Flow: Staff Takes Attendance

```mermaid
sequenceDiagram
    actor Staff as 👨‍🏫 Subject Staff
    participant App as Spring Boot
    participant DB as MySQL
    participant SMS as MSG91

    Staff->>App: Login
    App->>DB: Validate credentials
    Staff->>App: Select Year → Batch → Period
    Staff->>App: Click "Fetch Students"
    App->>DB: Get students in that batch
    App->>Staff: Table (locked OD/IL pre-filled)
    Staff->>App: Mark Present/Absent → Submit
    App->>App: Server: within 20 min?
    App->>DB: Save records + auto-set UL
    App->>SMS: Send SMS for each UL
```

## Links
- [[attendance Donbosco]]
- [[BRS]]

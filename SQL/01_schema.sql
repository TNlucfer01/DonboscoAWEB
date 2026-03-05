-- =========================================================================
-- DONBOSCO ATTENDANCE SYSTEM - DATABASE SCHEMA (v5.0)
-- v5.0 Changes:
--   - users: added email (login), managed_year (for YC)
--   - subjects: semester → ENUM('ODD','EVEN'), added UNIQUE(name,year,sem)
--   - timetable_slots: slot_type + 'OTHER'
--   - attendance_records: added subject_id (FK), fixed UNIQUE to include semester_id
--   - notification_log: added sent_to_phone snapshot
--   - batches: added student_count (auto-maintained via triggers)
--   - Triggers: auto-update batches.student_count on enrollment insert/delete
-- =========================================================================

DROP DATABASE IF EXISTS donbosco_attendance;
CREATE DATABASE IF NOT EXISTS donbosco_attendance;
USE donbosco_attendance;

-- ==========================================
-- 1. USERS
-- email = login credential (UNIQUE)
-- phone_number = SMS contact (UNIQUE)
-- managed_year = 1-4 for YEAR_COORDINATOR; NULL for others
-- ==========================================
CREATE TABLE users (
    user_id       INT          AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    phone_number  VARCHAR(15)  NOT NULL UNIQUE,
    role          ENUM('PRINCIPAL', 'YEAR_COORDINATOR', 'SUBJECT_STAFF') NOT NULL,
    managed_year  TINYINT      NULL,           -- 1–4 for YC; NULL for Principal & Staff
    password_hash VARCHAR(255) NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_managed_year CHECK (
        (role = 'YEAR_COORDINATOR' AND managed_year BETWEEN 1 AND 4)
        OR (role != 'YEAR_COORDINATOR' AND managed_year IS NULL)
    )
);

-- ==========================================
-- 2. BATCHES
-- student_count: auto-updated by trigger (do not set manually)
-- ==========================================
CREATE TABLE batches (
    batch_id      INT  AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(50) NOT NULL,
    batch_type    ENUM('THEORY', 'LAB') NOT NULL,
    year          TINYINT     NOT NULL,        -- 1 to 4
    capacity      INT         NOT NULL,        -- max students allowed
    student_count INT         NOT NULL DEFAULT 0  -- current enrolled count (trigger-managed)
);

-- ==========================================
-- 3. STUDENTS
-- ==========================================
CREATE TABLE students (
    student_id   INT          AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    roll_number  VARCHAR(20)  NOT NULL UNIQUE,
    phone        VARCHAR(15),
    email        VARCHAR(100),
    dob          DATE,
    gender       ENUM('MALE','FEMALE','OTHER'),
    address      TEXT,
    parent_phone VARCHAR(15)  NOT NULL,
    current_year TINYINT      NOT NULL,        -- 1 to 4
    batch_id     INT          NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE RESTRICT
);

-- ==========================================
-- 4. SEMESTERS
-- academic_year: 1–4 (year of study, NOT semester number)
-- is_active: only ONE should be TRUE at a time
-- ==========================================
CREATE TABLE semesters (
    semester_id   INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(50) NOT NULL,
    academic_year TINYINT     NOT NULL,
    is_active     BOOLEAN     NOT NULL DEFAULT FALSE
);

-- ==========================================
-- 5. SUBJECTS
-- semester: ENUM('ODD','EVEN') — enforces consistent casing
-- UNIQUE: prevents duplicate subject creation
-- ==========================================
CREATE TABLE subjects (
    subject_id          INT          AUTO_INCREMENT PRIMARY KEY,
    subject_name        VARCHAR(100) NOT NULL,
    subject_year        TINYINT      NOT NULL,     -- 1 to 4
    subject_description TEXT,
    credits             INT          NOT NULL,
    semester            ENUM('ODD', 'EVEN')  NOT NULL,
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME     ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (subject_name, subject_year, semester)
);

-- ==========================================
-- 6. TIMETABLE SLOTS
-- slot_type: THEORY | LAB | OTHER (breaks, assemblies, etc.)
-- ==========================================
CREATE TABLE timetable_slots (
    slot_id     INT     AUTO_INCREMENT PRIMARY KEY,
    slot_number TINYINT NOT NULL,                  -- 1 to 5 (or more)
    start_time  TIME    NOT NULL,
    end_time    TIME    NOT NULL,
    slot_type   ENUM('THEORY', 'LAB', 'OTHER') NOT NULL
);

-- SEED TIMETABLE SLOTS
INSERT INTO timetable_slots (slot_number, start_time, end_time, slot_type) VALUES
(1, '07:30:00', '10:00:00', 'LAB'),
(2, '10:30:00', '11:30:00', 'THEORY'),
(3, '11:30:00', '12:30:00', 'THEORY'),
(4, '13:30:00', '14:30:00', 'THEORY'),
(5, '14:45:00', '17:15:00', 'LAB');

-- ==========================================
-- 7. STUDENT BATCH ENROLLMENT
-- ==========================================
CREATE TABLE student_batch_enrollment (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id    INT NOT NULL,
    batch_id      INT NOT NULL,
    semester_id   INT NOT NULL,
    FOREIGN KEY (student_id)  REFERENCES students(student_id)  ON DELETE CASCADE,
    FOREIGN KEY (batch_id)    REFERENCES batches(batch_id)     ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE,
    UNIQUE (student_id, batch_id, semester_id)
);

-- TRIGGER: auto-increment batch student_count on enrollment
DELIMITER //
CREATE TRIGGER trg_batch_enroll_insert
AFTER INSERT ON student_batch_enrollment
FOR EACH ROW
BEGIN
    UPDATE batches SET student_count = student_count + 1 WHERE batch_id = NEW.batch_id;
END//

-- TRIGGER: auto-decrement batch student_count on unenrollment
CREATE TRIGGER trg_batch_enroll_delete
AFTER DELETE ON student_batch_enrollment
FOR EACH ROW
BEGIN
    UPDATE batches SET student_count = student_count - 1 WHERE batch_id = OLD.batch_id;
END//
DELIMITER ;

-- ==========================================
-- 8. STUDENT SUBJECT ENROLLMENT
-- ==========================================
CREATE TABLE student_subject_enrollment (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id    INT NOT NULL,
    subject_id    INT NOT NULL,
    semester_id   INT NOT NULL,
    FOREIGN KEY (student_id)  REFERENCES students(student_id)  ON DELETE CASCADE,
    FOREIGN KEY (subject_id)  REFERENCES subjects(subject_id)  ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE,
    UNIQUE (student_id, subject_id, semester_id)
);

-- ==========================================
-- 9. COLLEGE CALENDAR
-- ==========================================
CREATE TABLE college_calendar (
    calendar_id         INT  AUTO_INCREMENT PRIMARY KEY,
    date                DATE NOT NULL UNIQUE,
    day_type            ENUM('WORKING', 'HOLIDAY', 'SATURDAY_ENABLED') NOT NULL,
    holiday_name        VARCHAR(100),
    holiday_description TEXT,
    declared_by         INT  NOT NULL,
    declared_on         DATE NOT NULL,
    FOREIGN KEY (declared_by) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- ==========================================
-- 10. ATTENDANCE RECORDS
-- subject_id: which subject was being taught (staff picks at mark-time, NULLABLE)
-- UNIQUE now includes semester_id to handle students repeating a year
-- ==========================================
CREATE TABLE attendance_records (
    record_id    INT      AUTO_INCREMENT PRIMARY KEY,
    student_id   INT      NOT NULL,
    semester_id  INT      NOT NULL,
    subject_id   INT      NULL,                    -- which subject (nullable: marked by staff at run-time)
    date         DATE     NOT NULL,
    slot_id      INT      NOT NULL,
    status       ENUM('PRESENT', 'ABSENT', 'OD', 'INFORMED_LEAVE') NOT NULL,
    od_reason    TEXT,
    submitted_by INT      NOT NULL,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_locked    BOOLEAN  NOT NULL DEFAULT FALSE,
    FOREIGN KEY (student_id)  REFERENCES students(student_id)  ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id)  REFERENCES subjects(subject_id)  ON DELETE SET NULL,
    FOREIGN KEY (slot_id)     REFERENCES timetable_slots(slot_id) ON DELETE RESTRICT,
    FOREIGN KEY (submitted_by) REFERENCES users(user_id)       ON DELETE RESTRICT,
    UNIQUE (student_id, date, slot_id, semester_id)            -- semester_id added
);

-- ==========================================
-- 11. ATTENDANCE AUDIT LOG
-- ==========================================
CREATE TABLE attendance_audit_log (
    audit_id   INT      AUTO_INCREMENT PRIMARY KEY,
    record_id  INT      NOT NULL,
    changed_by INT      NOT NULL,
    old_status ENUM('PRESENT', 'ABSENT', 'OD', 'INFORMED_LEAVE') NOT NULL,
    new_status ENUM('PRESENT', 'ABSENT', 'OD', 'INFORMED_LEAVE') NOT NULL,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id)  REFERENCES attendance_records(record_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- ==========================================
-- 12. NOTIFICATION LOG
-- sent_to_phone: snapshot of parent phone at send time (immutable audit)
-- ==========================================
CREATE TABLE notification_log (
    log_id               INT      AUTO_INCREMENT PRIMARY KEY,
    student_id           INT      NOT NULL,
    semester_id          INT      NOT NULL,
    sent_to_phone        VARCHAR(15) NOT NULL,      -- snapshot of parent_phone at send time
    trigger_type         ENUM('PER_PERIOD', 'MONTHLY_SUMMARY') NOT NULL,
    trigger_date         DATE     NOT NULL,
    attendance_percentage DECIMAL(5,2),
    message_sent         TEXT     NOT NULL,
    sent_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status               ENUM('SENT', 'FAILED') NOT NULL,
    FOREIGN KEY (student_id)  REFERENCES students(student_id)  ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE
);

-- ==========================================
-- SEED: Principal
-- Replace email, phone, and password_hash with real values before going live.
-- ==========================================
INSERT INTO users (name, email, phone_number, role, managed_year, password_hash) VALUES
('Principal', 'principal@donbosco.edu', '9000000000', 'PRINCIPAL', NULL, '$2b$12$placeholder_hash_replace_in_prod');

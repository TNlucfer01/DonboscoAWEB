USE donbosco_attendance;

-- ==========================================
-- CRUD: semesters  (v4.0)
-- academic_year: 1–4 (year of study, NOT semester number)
-- is_active: only ONE semester should be TRUE at a time.
-- ==========================================

-- CREATE: Add a new semester (inactive by default)
PREPARE stmt FROM 'INSERT INTO semesters (name, academic_year, is_active) VALUES (?, ?, ?)';
SET @name          = 'Semester 1 (Odd)';
SET @academic_year = 1;  -- 1st year students
SET @is_active     = FALSE;
EXECUTE stmt USING @name, @academic_year, @is_active;
DEALLOCATE PREPARE stmt;

-- READ: Get all semesters
SELECT semester_id, name, academic_year, is_active FROM semesters ORDER BY academic_year, name;

-- READ: Get the currently active semester
SELECT semester_id, name, academic_year FROM semesters WHERE is_active = TRUE LIMIT 1;

-- READ: Get semesters for a given academic year
PREPARE stmt FROM 'SELECT semester_id, name FROM semesters WHERE academic_year = ?';
SET @academic_year = 1;
EXECUTE stmt USING @academic_year;
DEALLOCATE PREPARE stmt;

-- UPDATE: Rename a semester
PREPARE stmt FROM 'UPDATE semesters SET name = ? WHERE semester_id = ?';
SET @new_name    = 'Semester 1 (Odd) — 2025-2026';
SET @semester_id = 1;
EXECUTE stmt USING @new_name, @semester_id;
DEALLOCATE PREPARE stmt;

-- DELETE: Remove a semester
-- WARN: Will fail if any enrollment/attendance records reference this semester.
PREPARE stmt FROM 'DELETE FROM semesters WHERE semester_id = ?';
SET @semester_id = 99;
EXECUTE stmt USING @semester_id;
DEALLOCATE PREPARE stmt;

-- ACTIVATE: Mark one semester as active (deactivate all others first)
-- Step 1: Deactivate all
UPDATE semesters SET is_active = FALSE;
-- Step 2: Activate the target semester
PREPARE stmt FROM 'UPDATE semesters SET is_active = TRUE WHERE semester_id = ?';
SET @semester_id = 1;
EXECUTE stmt USING @semester_id;
DEALLOCATE PREPARE stmt;

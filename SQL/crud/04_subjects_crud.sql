USE donbosco_attendance;

-- ==========================================
-- CRUD: subjects
-- (db.md requirement) subject_code must be UNIQUE, year must be tracked
-- ==========================================

-- CREATE: Add a new subject (subject_code is unique per db.md requirement)
-- NOTE: If subject_code column doesn't exist yet in schema, refer to db.md schema update.
PREPARE stmt FROM 'INSERT INTO subjects (subject_name, subject_year, subject_description, credits, semester) VALUES (?, ?, ?, ?, ?)';
SET @name        = 'Data Structures';
SET @year        = 2;
SET @description = 'Arrays, Linked Lists, Trees, Graphs';
SET @credits     = 4;
SET @semester    = 'Odd'; -- 'Odd' | 'Even'
EXECUTE stmt USING @name, @year, @description, @credits, @semester;
DEALLOCATE PREPARE stmt;

-- READ: Get all subjects
SELECT subject_id, subject_name, subject_year, credits, semester FROM subjects ORDER BY subject_year, semester;

-- READ: Get subjects for a specific year
PREPARE stmt FROM 'SELECT subject_id, subject_name, credits, semester FROM subjects WHERE subject_year = ?';
SET @year = 1;
EXECUTE stmt USING @year;
DEALLOCATE PREPARE stmt;

-- READ: Get subjects for a specific year AND semester
PREPARE stmt FROM 'SELECT subject_id, subject_name, credits FROM subjects WHERE subject_year = ? AND semester = ?';
SET @year     = 1;
SET @semester = 'Odd';
EXECUTE stmt USING @year, @semester;
DEALLOCATE PREPARE stmt;

-- UPDATE: Modify a subject's name or credits
PREPARE stmt FROM 'UPDATE subjects SET subject_name = ?, credits = ? WHERE subject_id = ?';
SET @new_name   = 'Advanced Data Structures';
SET @new_credits = 5;
SET @subject_id  = 1;
EXECUTE stmt USING @new_name, @new_credits, @subject_id;
DEALLOCATE PREPARE stmt;

-- DELETE: Remove a subject
-- WARN: Will cascade-delete all student_subject_enrollment rows for this subject.
PREPARE stmt FROM 'DELETE FROM subjects WHERE subject_id = ?';
SET @subject_id = 99;
EXECUTE stmt USING @subject_id;
DEALLOCATE PREPARE stmt;

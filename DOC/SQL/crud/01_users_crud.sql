USE donbosco_attendance;

-- ==========================================
-- CRUD: users  (v4.0)
-- email  = login field (UNIQUE)
-- phone_number = SMS contact (UNIQUE)
-- ==========================================

-- CREATE: Add a new staff member
-- managed_year: set 1-4 for YEAR_COORDINATOR; leave NULL for PRINCIPAL and SUBJECT_STAFF
PREPARE stmt FROM 'INSERT INTO users (name, email, phone_number, role, managed_year, password_hash) VALUES (?, ?, ?, ?, ?, ?)';
SET @name          = 'New Staff';
SET @email         = 'staff@donbosco.edu';
SET @phone_number  = '90000000001';
SET @role          = 'YEAR_COORDINATOR';
SET @managed_year  = 1;  -- set NULL for PRINCIPAL and SUBJECT_STAFF
SET @password_hash = '$2b$12$placeholder_replace_with_bcrypt';
EXECUTE stmt USING @name, @email, @phone_number, @role, @managed_year, @password_hash;
DEALLOCATE PREPARE stmt;

-- READ: Get all users
SELECT user_id, name, email, phone_number, role, created_at FROM users ORDER BY role, name;

-- READ: Login lookup — by email
PREPARE stmt FROM 'SELECT user_id, name, role, password_hash FROM users WHERE email = ?';
SET @email = 'principal@donbosco.edu';
EXECUTE stmt USING @email;
DEALLOCATE PREPARE stmt;

-- READ: Get a single user
PREPARE stmt FROM 'SELECT user_id, name, email, phone_number, role FROM users WHERE user_id = ?';
SET @user_id = 1;
EXECUTE stmt USING @user_id;
DEALLOCATE PREPARE stmt;

-- UPDATE: Change staff role
PREPARE stmt FROM 'UPDATE users SET role = ? WHERE user_id = ?';
SET @role    = 'SUBJECT_STAFF';
SET @user_id = 1;
EXECUTE stmt USING @role, @user_id;
DEALLOCATE PREPARE stmt;

-- UPDATE: Change password
PREPARE stmt FROM 'UPDATE users SET password_hash = ? WHERE user_id = ?';
SET @password_hash = '$2b$12$new_bcrypt_hash_here';
SET @user_id       = 1;
EXECUTE stmt USING @password_hash, @user_id;
DEALLOCATE PREPARE stmt;

-- UPDATE: Reset name / email / phone
PREPARE stmt FROM 'UPDATE users SET name = ?, email = ?, phone_number = ? WHERE user_id = ?';
SET @name         = 'Updated Name';
SET @email        = 'updated@donbosco.edu';
SET @phone_number = '90000000002';
SET @user_id      = 1;
EXECUTE stmt USING @name, @email, @phone_number, @user_id;
DEALLOCATE PREPARE stmt;

-- DELETE: Remove a user
-- WARN: Will fail if user has declared holidays or submitted attendance.
PREPARE stmt FROM 'DELETE FROM users WHERE user_id = ?';
SET @user_id = 99;
EXECUTE stmt USING @user_id;
DEALLOCATE PREPARE stmt;

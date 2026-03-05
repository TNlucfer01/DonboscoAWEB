USE donbosco_attendance;

-- ==========================================
-- CRUD: batches
-- batch_size is DYNAMIC — a trigger auto-updates capacity
-- based on student count for that batch.
-- ==========================================

-- CREATE: Add a new batch
-- NOTE: capacity is set to 0; a trigger will auto-increment it on each student add.
PREPARE stmt FROM 'INSERT INTO batches (name, batch_type, year, capacity) VALUES (?, ?, ?, 0)';
SET @name       = 'CS C 2nd Yr (T)';
SET @batch_type = 'THEORY'; -- THEORY | LAB
SET @year       = 2;
EXECUTE stmt USING @name, @batch_type, @year;
DEALLOCATE PREPARE stmt;

-- READ: Get all batches
SELECT batch_id, name, batch_type, year, capacity FROM batches ORDER BY year, name;

-- READ: Get all batches for a specific year
PREPARE stmt FROM 'SELECT batch_id, name, batch_type, capacity FROM batches WHERE year = ?';
SET @year = 1;
EXECUTE stmt USING @year;
DEALLOCATE PREPARE stmt;

-- READ: Get a single batch by ID
PREPARE stmt FROM 'SELECT * FROM batches WHERE batch_id = ?';
SET @batch_id = 1;
EXECUTE stmt USING @batch_id;
DEALLOCATE PREPARE stmt;

-- UPDATE: Rename a batch
PREPARE stmt FROM 'UPDATE batches SET name = ? WHERE batch_id = ?';
SET @new_name = 'CS A Section (T)';
SET @batch_id = 1;
EXECUTE stmt USING @new_name, @batch_id;
DEALLOCATE PREPARE stmt;

-- DELETE: Remove a batch
-- WARN: Will fail if students are still assigned to this batch (ON DELETE RESTRICT).
PREPARE stmt FROM 'DELETE FROM batches WHERE batch_id = ?';
SET @batch_id = 99;
EXECUTE stmt USING @batch_id;
DEALLOCATE PREPARE stmt;

-- ==========================================
-- TRIGGER: Auto-update batch capacity when a student is added
-- Run this once during schema setup (included here for reference).
-- ==========================================
DROP TRIGGER IF EXISTS trg_batch_capacity_on_insert;
DELIMITER //
CREATE TRIGGER trg_batch_capacity_on_insert
AFTER INSERT ON students
FOR EACH ROW
BEGIN
    UPDATE batches SET capacity = capacity + 1 WHERE batch_id = NEW.batch_id;
END;
//
DELIMITER ;

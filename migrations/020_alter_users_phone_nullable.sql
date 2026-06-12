-- =============================================
-- ALTER USERS TABLE TO MAKE PHONE COLUMN NULLABLE
-- =============================================

ALTER TABLE users MODIFY COLUMN phone VARCHAR(20) NULL;

-- Add special_requests column to bookings table if it doesn't exist
-- Uses the same safe migration pattern as 005

DELIMITER $$

CREATE PROCEDURE add_special_requests_if_missing()
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'bookings'
          AND column_name = 'special_requests'
    ) THEN
        ALTER TABLE bookings
            ADD COLUMN special_requests TEXT NULL AFTER rejection_reason;
    END IF;
END$$

DELIMITER ;

CALL add_special_requests_if_missing();

DROP PROCEDURE add_special_requests_if_missing;

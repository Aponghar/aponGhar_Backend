DELIMITER $$

CREATE PROCEDURE add_booking_column_if_missing(
    IN column_name_to_add VARCHAR(64),
    IN alter_sql TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'bookings'
          AND column_name = column_name_to_add
    ) THEN
        SET @stmt = alter_sql;
        PREPARE prepared_stmt FROM @stmt;
        EXECUTE prepared_stmt;
        DEALLOCATE PREPARE prepared_stmt;
    END IF;
END$$

DELIMITER ;

CALL add_booking_column_if_missing('booking_type', 'ALTER TABLE bookings ADD COLUMN booking_type ENUM(''NIGHTLY'',''HOURLY'') NOT NULL DEFAULT ''NIGHTLY'' AFTER property_id');
CALL add_booking_column_if_missing('pricing_option', 'ALTER TABLE bookings ADD COLUMN pricing_option ENUM(''PER_NIGHT'',''HOUR_3'',''HOUR_6'',''HOUR_9'',''BASE'') NOT NULL DEFAULT ''PER_NIGHT'' AFTER booking_type');
CALL add_booking_column_if_missing('check_in_time', 'ALTER TABLE bookings ADD COLUMN check_in_time TIME NULL AFTER check_in_date');
CALL add_booking_column_if_missing('check_out_time', 'ALTER TABLE bookings ADD COLUMN check_out_time TIME NULL AFTER check_out_date');
CALL add_booking_column_if_missing('guest_name', 'ALTER TABLE bookings ADD COLUMN guest_name VARCHAR(150) NULL AFTER booked_rooms');
CALL add_booking_column_if_missing('guest_email', 'ALTER TABLE bookings ADD COLUMN guest_email VARCHAR(150) NULL AFTER guest_name');
CALL add_booking_column_if_missing('guest_age', 'ALTER TABLE bookings ADD COLUMN guest_age INT NULL AFTER guest_email');
CALL add_booking_column_if_missing('customer_name', 'ALTER TABLE bookings ADD COLUMN customer_name VARCHAR(150) NULL AFTER guest_age');
CALL add_booking_column_if_missing('payment_method', 'ALTER TABLE bookings ADD COLUMN payment_method ENUM(''ONLINE'',''OFFLINE'') NOT NULL DEFAULT ''ONLINE'' AFTER gateway_paid');
CALL add_booking_column_if_missing('owner_action_at', 'ALTER TABLE bookings ADD COLUMN owner_action_at TIMESTAMP NULL AFTER payment_method');
CALL add_booking_column_if_missing('rejection_reason', 'ALTER TABLE bookings ADD COLUMN rejection_reason TEXT NULL AFTER owner_action_at');

DROP PROCEDURE add_booking_column_if_missing;

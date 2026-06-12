-- Store the exact booking pricing snapshot used for customer, owner, and admin views.
-- total_amount remains the customer-facing room total before coupon/wallet deductions.

DELIMITER //

CREATE PROCEDURE add_booking_pricing_column_if_missing(
    IN p_column_name VARCHAR(64),
    IN p_alter_sql TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'bookings'
          AND column_name = p_column_name
    ) THEN
        SET @sql = p_alter_sql;
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DELIMITER ;

CALL add_booking_pricing_column_if_missing(
    'booking_base_amount',
    'ALTER TABLE bookings ADD COLUMN booking_base_amount DECIMAL(12, 2) NULL AFTER total_amount'
);

CALL add_booking_pricing_column_if_missing(
    'booking_commission_percentage',
    'ALTER TABLE bookings ADD COLUMN booking_commission_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0 AFTER booking_base_amount'
);

CALL add_booking_pricing_column_if_missing(
    'booking_commission_amount',
    'ALTER TABLE bookings ADD COLUMN booking_commission_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER booking_commission_percentage'
);

CALL add_booking_pricing_column_if_missing(
    'booking_unit_base_price',
    'ALTER TABLE bookings ADD COLUMN booking_unit_base_price DECIMAL(12, 2) NULL AFTER booking_commission_amount'
);

CALL add_booking_pricing_column_if_missing(
    'booking_unit_selling_price',
    'ALTER TABLE bookings ADD COLUMN booking_unit_selling_price DECIMAL(12, 2) NULL AFTER booking_unit_base_price'
);

DROP PROCEDURE add_booking_pricing_column_if_missing;

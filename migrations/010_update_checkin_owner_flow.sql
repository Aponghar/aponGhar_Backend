-- Align existing check-in tables with owner-initiated check-ins.
ALTER TABLE check_ins
MODIFY status ENUM('USER_REQUEST', 'OWNER_CONFIRMED', 'ADMIN_RECORDED', 'CANCELLED')
DEFAULT 'OWNER_CONFIRMED';

SET @index_exists := (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'check_ins'
      AND index_name = 'uq_checkin_booking'
);

SET @add_index_sql := IF(
    @index_exists = 0,
    'ALTER TABLE check_ins ADD UNIQUE KEY uq_checkin_booking (booking_id)',
    'SELECT 1'
);

PREPARE add_checkin_booking_index FROM @add_index_sql;
EXECUTE add_checkin_booking_index;
DEALLOCATE PREPARE add_checkin_booking_index;

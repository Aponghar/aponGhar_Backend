-- Track the physical room assigned at owner check-in and when the guest leaves.
DELIMITER //

CREATE PROCEDURE add_checkin_column_if_missing(
    IN p_column_name VARCHAR(64),
    IN p_alter_sql TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'check_ins'
          AND column_name = p_column_name
    ) THEN
        SET @sql = p_alter_sql;
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

CREATE PROCEDURE add_checkin_index_if_missing(
    IN p_index_name VARCHAR(64),
    IN p_alter_sql TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = 'check_ins'
          AND index_name = p_index_name
    ) THEN
        SET @sql = p_alter_sql;
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DELIMITER ;

CALL add_checkin_column_if_missing(
    'assigned_room_id',
    'ALTER TABLE check_ins ADD COLUMN assigned_room_id INT NULL AFTER room_id'
);

CALL add_checkin_column_if_missing(
    'checked_out_at',
    'ALTER TABLE check_ins ADD COLUMN checked_out_at TIMESTAMP NULL AFTER admin_recorded_at'
);

CALL add_checkin_index_if_missing(
    'idx_assigned_room',
    'ALTER TABLE check_ins ADD INDEX idx_assigned_room (assigned_room_id)'
);

SET @fk_exists := (
    SELECT COUNT(1)
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'check_ins'
      AND constraint_name = 'fk_checkins_assigned_room'
      AND constraint_type = 'FOREIGN KEY'
);

SET @add_fk_sql := IF(
    @fk_exists = 0,
    'ALTER TABLE check_ins ADD CONSTRAINT fk_checkins_assigned_room FOREIGN KEY (assigned_room_id) REFERENCES room(id) ON DELETE SET NULL',
    'SELECT 1'
);

PREPARE add_checkin_assigned_room_fk FROM @add_fk_sql;
EXECUTE add_checkin_assigned_room_fk;
DEALLOCATE PREPARE add_checkin_assigned_room_fk;

DROP PROCEDURE add_checkin_column_if_missing;
DROP PROCEDURE add_checkin_index_if_missing;

-- Track Razorpay attempts for owner commission payments to admin.

DELIMITER //

CREATE PROCEDURE add_admin_commission_payment_column_if_missing(
    IN p_column_name VARCHAR(64),
    IN p_alter_sql TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'admin_commissions'
          AND column_name = p_column_name
    ) THEN
        SET @sql = p_alter_sql;
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DELIMITER ;

CALL add_admin_commission_payment_column_if_missing(
    'razorpay_order_id',
    'ALTER TABLE admin_commissions ADD COLUMN razorpay_order_id VARCHAR(100) NULL AFTER payment_proof_notes'
);

CALL add_admin_commission_payment_column_if_missing(
    'razorpay_payment_id',
    'ALTER TABLE admin_commissions ADD COLUMN razorpay_payment_id VARCHAR(100) NULL AFTER razorpay_order_id'
);

CALL add_admin_commission_payment_column_if_missing(
    'razorpay_signature',
    'ALTER TABLE admin_commissions ADD COLUMN razorpay_signature VARCHAR(255) NULL AFTER razorpay_payment_id'
);

CALL add_admin_commission_payment_column_if_missing(
    'razorpay_payment_status',
    'ALTER TABLE admin_commissions ADD COLUMN razorpay_payment_status ENUM(''CREATED'', ''SUCCESS'', ''FAILED'') NULL AFTER razorpay_signature'
);

CALL add_admin_commission_payment_column_if_missing(
    'razorpay_failure_reason',
    'ALTER TABLE admin_commissions ADD COLUMN razorpay_failure_reason TEXT NULL AFTER razorpay_payment_status'
);

DROP PROCEDURE add_admin_commission_payment_column_if_missing;

CREATE INDEX idx_admin_commissions_razorpay_order
ON admin_commissions(razorpay_order_id);

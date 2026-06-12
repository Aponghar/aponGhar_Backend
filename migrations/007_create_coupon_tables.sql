-- =============================================
-- COUPON TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS coupons (

    id                      INT AUTO_INCREMENT PRIMARY KEY,

    owner_id                INT NOT NULL,

    property_id             INT NOT NULL,

    coupon_code             VARCHAR(50) NOT NULL UNIQUE,

    discount_type           ENUM('PERCENTAGE', 'FIXED')
                            NOT NULL DEFAULT 'PERCENTAGE',

    discount_value          DECIMAL(10, 2) NOT NULL,

    minimum_booking_amount  DECIMAL(10, 2) DEFAULT 0,

    maximum_discount_amount DECIMAL(10, 2) DEFAULT NULL,

    usage_limit             INT DEFAULT NULL,

    used_count              INT DEFAULT 0,

    start_date              DATETIME NOT NULL,

    expiry_date             DATETIME NOT NULL,

    is_active               BOOLEAN DEFAULT TRUE,

    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS coupon_usages (

    id              INT AUTO_INCREMENT PRIMARY KEY,

    coupon_id       INT NOT NULL,

    user_id         INT NOT NULL,

    booking_id      INT NOT NULL,

    discount_amount DECIMAL(10, 2) NOT NULL,

    used_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (coupon_id)
        REFERENCES coupons(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
        ON DELETE CASCADE
);

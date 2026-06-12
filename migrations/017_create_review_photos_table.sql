-- Review system schema, including property rating rollups.

DELIMITER //

CREATE PROCEDURE add_review_property_column_if_missing(
    IN p_column_name VARCHAR(64),
    IN p_alter_sql TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'properties'
          AND column_name = p_column_name
    ) THEN
        SET @sql = p_alter_sql;
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DELIMITER ;

CALL add_review_property_column_if_missing(
    'average_rating',
    'ALTER TABLE properties ADD COLUMN average_rating DECIMAL(3, 2) NOT NULL DEFAULT 0 AFTER commission_percentage'
);

CALL add_review_property_column_if_missing(
    'total_reviews',
    'ALTER TABLE properties ADD COLUMN total_reviews INT NOT NULL DEFAULT 0 AFTER average_rating'
);

CALL add_review_property_column_if_missing(
    'trust_score',
    'ALTER TABLE properties ADD COLUMN trust_score DECIMAL(6, 2) NOT NULL DEFAULT 0 AFTER total_reviews'
);

DROP PROCEDURE add_review_property_column_if_missing;

CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    property_id INT NOT NULL,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL,
    review_text TEXT DEFAULT NULL,
    review_status ENUM('VISIBLE', 'HIDDEN', 'PENDING', 'REJECTED') DEFAULT 'VISIBLE',
    moderation_notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reviews_property
        FOREIGN KEY (property_id) REFERENCES properties(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reviews_room
        FOREIGN KEY (room_id) REFERENCES room(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_reviews_rating
        CHECK (rating BETWEEN 1 AND 5),
    UNIQUE KEY uniq_reviews_booking_user (booking_id, user_id),
    INDEX idx_reviews_property_status (property_id, review_status),
    INDEX idx_reviews_user (user_id)
);

CREATE TABLE IF NOT EXISTS review_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_photos_review
        FOREIGN KEY (review_id) REFERENCES reviews(id)
        ON DELETE CASCADE,
    INDEX idx_review_photos_review (review_id)
);

CREATE TABLE IF NOT EXISTS review_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    reported_by INT NOT NULL,
    reason VARCHAR(100) NOT NULL,
    additional_notes TEXT DEFAULT NULL,
    report_status ENUM('OPEN', 'REVIEWED', 'DISMISSED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_reports_review
        FOREIGN KEY (review_id) REFERENCES reviews(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_review_reports_user
        FOREIGN KEY (reported_by) REFERENCES users(id)
        ON DELETE CASCADE,
    INDEX idx_review_reports_review (review_id),
    INDEX idx_review_reports_status (report_status)
);

CREATE TABLE IF NOT EXISTS review_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    owner_id INT NOT NULL,
    response_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_responses_review
        FOREIGN KEY (review_id) REFERENCES reviews(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_review_responses_owner
        FOREIGN KEY (owner_id) REFERENCES users(id)
        ON DELETE CASCADE,
    INDEX idx_review_responses_review (review_id)
);

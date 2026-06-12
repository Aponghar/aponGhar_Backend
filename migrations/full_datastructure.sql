-- ============================================================
-- Hotel Booking System - Database Setup Script
-- Run each statement one by one in order.
-- All tables are created in dependency order (no FK errors).
-- ============================================================

-- 1. Create & select the database
CREATE DATABASE IF NOT EXISTS hotel_booking_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE hotel_booking_system;

-- ============================================================
-- STEP 1: Tables with NO foreign key dependencies
-- ============================================================

-- 2. users
CREATE TABLE `users` (
  `id`                    INT            NOT NULL AUTO_INCREMENT,
  `full_name`             VARCHAR(100)   NOT NULL,
  `email`                 VARCHAR(150)   NOT NULL,
  `phone`                 VARCHAR(20)    DEFAULT NULL,
  `password`              VARCHAR(255)   NOT NULL,
  `role`                  ENUM('USER','OWNER','ADMIN') DEFAULT 'USER',
  `is_verified`           TINYINT(1)     DEFAULT '0',
  `is_active`             TINYINT(1)     DEFAULT '1',
  `created_at`            TIMESTAMP      NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`            TIMESTAMP      NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `commission_percentage` DECIMAL(5,2)   DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_owner_commission` (`commission_percentage`)
) ENGINE=InnoDB AUTO_INCREMENT=45
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 3. amenities
CREATE TABLE `amenities` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `amenity_name` VARCHAR(100) NOT NULL,
  `icon`         VARCHAR(255) DEFAULT NULL,
  `created_at`   TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `amenity_name` (`amenity_name`)
) ENGINE=InnoDB AUTO_INCREMENT=16
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 4. advertisements
CREATE TABLE `advertisements` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `image_url`    VARCHAR(500) NOT NULL,
  `redirect_url` VARCHAR(500) NOT NULL,
  `is_active`    TINYINT      DEFAULT '1',
  `created_at`   TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 5. schema_migrations
CREATE TABLE `schema_migrations` (
  `id`             INT          NOT NULL AUTO_INCREMENT,
  `migration_name` VARCHAR(255) NOT NULL,
  `applied_at`     TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `migration_name` (`migration_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- STEP 2: Tables that depend only on `users`
-- ============================================================

-- 6. properties  (depends on: users)
CREATE TABLE `properties` (
  `id`                    INT            NOT NULL AUTO_INCREMENT,
  `owner_id`              INT            NOT NULL,
  `property_name`         VARCHAR(255)   NOT NULL,
  `property_type`         ENUM('HOTEL','HOMESTAY','RESORT','APARTMENT','VILLA') NOT NULL,
  `description`           TEXT,
  `location`              VARCHAR(255)   NOT NULL,
  `address`               TEXT           NOT NULL,
  `city`                  VARCHAR(100)   NOT NULL,
  `state`                 VARCHAR(100)   NOT NULL,
  `country`               VARCHAR(100)   NOT NULL,
  `zip_code`              VARCHAR(20)    DEFAULT NULL,
  `latitude`              DECIMAL(10,8)  DEFAULT NULL,
  `longitude`             DECIMAL(11,8)  DEFAULT NULL,
  `check_in_time`         TIME           DEFAULT NULL,
  `check_out_time`        TIME           DEFAULT NULL,
  `status`                ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `is_active`             TINYINT(1)     DEFAULT '1',
  `created_at`            TIMESTAMP      NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`            TIMESTAMP      NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `featured`              TINYINT(1)     DEFAULT '0',
  `total_bookings`        INT            DEFAULT '0',
  `commission_percentage` DECIMAL(5,2)   DEFAULT '0.00',
  `average_rating`        DECIMAL(3,2)   DEFAULT '0.00',
  `total_reviews`         INT            DEFAULT '0',
  `trust_score`           DECIMAL(5,2)   DEFAULT '0.00',
  `approval_status`       ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `property_image`        VARCHAR(500)   DEFAULT NULL,
  `google_maps_link`      VARCHAR(500)   DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_properties_city`     (`city`),
  KEY `idx_properties_owner`    (`owner_id`),
  KEY `idx_properties_status`   (`status`),
  KEY `idx_properties_created`  (`created_at`),
  KEY `idx_properties_featured` (`featured`),
  FULLTEXT KEY `property_name`   (`property_name`,`description`,`city`,`address`),
  FULLTEXT KEY `property_name_2` (`property_name`,`description`,`city`,`address`),
  CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 7. wallets  (depends on: users)
CREATE TABLE `wallets` (
  `id`              INT           NOT NULL AUTO_INCREMENT,
  `user_id`         INT           NOT NULL,
  `wallet_type`     ENUM('USER','OWNER') NOT NULL,
  `balance`         DECIMAL(12,2) DEFAULT '0.00',
  `created_at`      TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `pending_balance` DECIMAL(12,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `wallets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 8. owner_applications  (depends on: users)
CREATE TABLE `owner_applications` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `user_id`         INT          NOT NULL,
  `property_name`   VARCHAR(255) NOT NULL,
  `property_type`   VARCHAR(100) NOT NULL,
  `location`        VARCHAR(255) NOT NULL,
  `area`            VARCHAR(255) DEFAULT NULL,
  `owner_name`      VARCHAR(255) NOT NULL,
  `contact_number`  VARCHAR(20)  NOT NULL,
  `description`     TEXT,
  `status`          ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `admin_message`   TEXT,
  `created_at`      TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `owner_applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 9. otp_verifications  (depends on: users)
CREATE TABLE `otp_verifications` (
  `id`         INT         NOT NULL AUTO_INCREMENT,
  `user_id`    INT         NOT NULL,
  `otp_code`   VARCHAR(10) NOT NULL,
  `expires_at` DATETIME    NOT NULL,
  `is_used`    TINYINT(1)  DEFAULT '0',
  `created_at` TIMESTAMP   NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `otp_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 10. password_resets  (depends on: users)
CREATE TABLE `password_resets` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `user_id`     INT          NOT NULL,
  `reset_token` VARCHAR(255) NOT NULL,
  `expires_at`  DATETIME     NOT NULL,
  `is_used`     TINYINT(1)   DEFAULT '0',
  `created_at`  TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 11. notifications  (depends on: users)
CREATE TABLE `notifications` (
  `id`                INT          NOT NULL AUTO_INCREMENT,
  `user_id`           INT          NOT NULL,
  `title`             VARCHAR(255) NOT NULL,
  `message`           TEXT         NOT NULL,
  `notification_type` ENUM('BOOKING','BOOKING_PAYMENT','BOOKING_CANCELLED','BOOKING_CONFIRMED',
                           'PAYMENT_RECEIVED','REFUND_INITIATED','REFUND_COMPLETED','WALLET')
                      DEFAULT 'BOOKING_PAYMENT',
  `is_read`           TINYINT(1)   DEFAULT '0',
  `created_at`        TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=92
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- STEP 3: Tables that depend on `properties`
-- ============================================================

-- 12. room  (depends on: properties)
CREATE TABLE `room` (
  `id`              INT           NOT NULL AUTO_INCREMENT,
  `room_id`         VARCHAR(50)   NOT NULL,
  `property_id`     INT           NOT NULL,
  `room_name`       VARCHAR(255)  NOT NULL,
  `room_type`       VARCHAR(100)  NOT NULL,
  `description`     TEXT,
  `max_adults`      INT           NOT NULL DEFAULT '1',
  `max_children`    INT           NOT NULL DEFAULT '0',
  `bed_type`        VARCHAR(100)  DEFAULT NULL,
  `room_size`       VARCHAR(50)   DEFAULT NULL,
  `room_amenities`  JSON          DEFAULT NULL,
  `room_benefits`   JSON          DEFAULT NULL,
  `price_type`      ENUM('PER_NIGHT','HOURLY','BOTH') NOT NULL,
  `is_active`       TINYINT(1)    DEFAULT '1',
  `created_at`      TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_id` (`room_id`),
  KEY `idx_room_id`      (`room_id`),
  KEY `idx_property_id`  (`property_id`),
  KEY `idx_is_active`    (`is_active`),
  CONSTRAINT `room_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 13. property_images  (depends on: properties)
CREATE TABLE `property_images` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `property_id` INT          NOT NULL,
  `image_url`   VARCHAR(500) NOT NULL,
  `created_at`  TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `property_id` (`property_id`),
  CONSTRAINT `property_images_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 14. property_amenities  (depends on: properties, amenities)
CREATE TABLE `property_amenities` (
  `id`          INT       NOT NULL AUTO_INCREMENT,
  `property_id` INT       NOT NULL,
  `amenity_id`  INT       NOT NULL,
  `created_at`  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `property_id` (`property_id`),
  KEY `amenity_id`  (`amenity_id`),
  CONSTRAINT `property_amenities_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `property_amenities_ibfk_2` FOREIGN KEY (`amenity_id`)  REFERENCES `amenities`   (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 15. property_rules  (depends on: properties)
CREATE TABLE `property_rules` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `property_id` INT          NOT NULL,
  `rule_type`   VARCHAR(100) NOT NULL,
  `rule_value`  TEXT         NOT NULL,
  `created_at`  TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `property_id` (`property_id`),
  CONSTRAINT `property_rules_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 16. coupons  (depends on: users, properties)
CREATE TABLE `coupons` (
  `id`                     INT           NOT NULL AUTO_INCREMENT,
  `owner_id`               INT           NOT NULL,
  `property_id`            INT           DEFAULT NULL,
  `coupon_code`            VARCHAR(100)  NOT NULL,
  `discount_type`          ENUM('PERCENTAGE','FIXED') NOT NULL,
  `discount_value`         DECIMAL(10,2) NOT NULL,
  `minimum_booking_amount` DECIMAL(10,2) DEFAULT '0.00',
  `maximum_discount_amount`DECIMAL(10,2) DEFAULT NULL,
  `usage_limit`            INT           DEFAULT NULL,
  `used_count`             INT           DEFAULT '0',
  `start_date`             DATETIME      NOT NULL,
  `expiry_date`            DATETIME      NOT NULL,
  `is_active`              TINYINT(1)    DEFAULT '1',
  `created_at`             TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  `once_per_user`          TINYINT(1)    DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupon_code` (`coupon_code`),
  KEY `owner_id`              (`owner_id`),
  KEY `idx_coupons_code`      (`coupon_code`),
  KEY `idx_coupons_property`  (`property_id`),
  KEY `idx_coupons_expiry`    (`expiry_date`),
  KEY `idx_coupons_active`    (`is_active`),
  CONSTRAINT `coupons_ibfk_1` FOREIGN KEY (`owner_id`)    REFERENCES `users`      (`id`),
  CONSTRAINT `coupons_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- STEP 4: Tables that depend on `room`
-- ============================================================

-- 17. room_price  (depends on: properties, room)
CREATE TABLE `room_price` (
  `id`             INT           NOT NULL AUTO_INCREMENT,
  `room_id`        VARCHAR(50)   NOT NULL,
  `property_id`    INT           NOT NULL,
  `base_price`     DECIMAL(12,2) NOT NULL,
  `price_per_night`DECIMAL(12,2) DEFAULT NULL,
  `price_3hours`   DECIMAL(12,2) DEFAULT NULL,
  `price_6hours`   DECIMAL(12,2) DEFAULT NULL,
  `price_9hours`   DECIMAL(12,2) DEFAULT NULL,
  `created_at`     TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_room_id`     (`room_id`),
  KEY `idx_property_id` (`property_id`),
  CONSTRAINT `room_price_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `room_price_ibfk_2` FOREIGN KEY (`room_id`)     REFERENCES `room`       (`room_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 18. room_images  (depends on: room.room_id — stored as VARCHAR, no FK enforced in original)
CREATE TABLE `room_images` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT,
  `room_id`    VARCHAR(50)  NOT NULL,
  `image_url`  VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 19. room_inventory  (depends on: room)
CREATE TABLE `room_inventory` (
  `id`              INT       NOT NULL AUTO_INCREMENT,
  `room_id`         INT       NOT NULL,
  `inventory_date`  DATE      NOT NULL,
  `total_rooms`     INT       NOT NULL DEFAULT '1',
  `available_rooms` INT       NOT NULL DEFAULT '1',
  `created_at`      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_room_inventory_date` (`room_id`,`inventory_date`),
  KEY `idx_room_inventory_room` (`room_id`),
  KEY `idx_room_inventory_date` (`inventory_date`),
  CONSTRAINT `fk_room_inventory_room` FOREIGN KEY (`room_id`) REFERENCES `room` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=67
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- STEP 5: bookings  (depends on: users, properties, coupons)
-- Note: room FK omitted in original DDL; kept consistent here.
-- ============================================================

-- 20. bookings
CREATE TABLE `bookings` (
  `id`                          INT           NOT NULL AUTO_INCREMENT,
  `booking_code`                VARCHAR(50)   NOT NULL,
  `user_id`                     INT           NOT NULL,
  `room_id`                     INT           NOT NULL,
  `property_id`                 INT           NOT NULL,
  `booking_type`                ENUM('NIGHTLY','HOURLY') NOT NULL DEFAULT 'NIGHTLY',
  `pricing_option`              ENUM('PER_NIGHT','HOUR_3','HOUR_6','HOUR_9','BASE') NOT NULL DEFAULT 'PER_NIGHT',
  `check_in_date`               DATE          NOT NULL,
  `check_in_time`               TIME          DEFAULT NULL,
  `check_out_date`              DATE          NOT NULL,
  `check_out_time`              TIME          DEFAULT NULL,
  `guests`                      INT           NOT NULL,
  `booked_rooms`                INT           DEFAULT '1',
  `guest_name`                  VARCHAR(150)  DEFAULT NULL,
  `guest_email`                 VARCHAR(150)  DEFAULT NULL,
  `guest_age`                   INT           DEFAULT NULL,
  `customer_name`               VARCHAR(150)  DEFAULT NULL,
  `total_amount`                DECIMAL(10,2) NOT NULL,
  `booking_base_amount`         DECIMAL(12,2) DEFAULT NULL,
  `booking_commission_percentage` DECIMAL(5,2) NOT NULL DEFAULT '0.00',
  `booking_commission_amount`   DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `booking_unit_base_price`     DECIMAL(12,2) DEFAULT NULL,
  `booking_unit_selling_price`  DECIMAL(12,2) DEFAULT NULL,
  `booking_status`              ENUM('PENDING','CONFIRMED','CANCELLED','COMPLETED') DEFAULT 'PENDING',
  `payment_status`              ENUM('PENDING','PAID','FAILED','REFUNDED') DEFAULT 'PENDING',
  `special_requests`            TEXT,
  `created_at`                  TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`                  TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `coupon_id`                   INT           DEFAULT NULL,
  `coupon_discount`             DECIMAL(10,2) DEFAULT '0.00',
  `wallet_used`                 DECIMAL(10,2) DEFAULT '0.00',
  `gateway_paid`                DECIMAL(10,2) DEFAULT '0.00',
  `payment_method`              ENUM('ONLINE','OFFLINE') NOT NULL DEFAULT 'ONLINE',
  `owner_action_at`             TIMESTAMP     NULL DEFAULT NULL,
  `rejection_reason`            TEXT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_code` (`booking_code`),
  KEY `fk_booking_coupon`      (`coupon_id`),
  KEY `idx_bookings_user`      (`user_id`),
  KEY `idx_bookings_property`  (`property_id`),
  KEY `idx_bookings_room`      (`room_id`),
  KEY `idx_bookings_status`    (`booking_status`),
  KEY `idx_bookings_checkin`   (`check_in_date`),
  KEY `idx_bookings_checkout`  (`check_out_date`),
  KEY `idx_bookings_created`   (`created_at`),
  CONSTRAINT `bookings_ibfk_1`   FOREIGN KEY (`user_id`)     REFERENCES `users`      (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_3`   FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_coupon` FOREIGN KEY (`coupon_id`)   REFERENCES `coupons`    (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=52
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- STEP 6: Tables that depend on `bookings`
-- ============================================================

-- 21. check_ins  (depends on: bookings, users, properties, room)
CREATE TABLE `check_ins` (
  `id`                 INT           NOT NULL AUTO_INCREMENT,
  `booking_id`         INT           NOT NULL,
  `user_id`            INT           NOT NULL,
  `owner_id`           INT           NOT NULL,
  `property_id`        INT           NOT NULL,
  `room_id`            INT           NOT NULL,
  `assigned_room_id`   INT           DEFAULT NULL,
  `status`             ENUM('USER_REQUEST','OWNER_CONFIRMED','ADMIN_RECORDED','CANCELLED') DEFAULT 'OWNER_CONFIRMED',
  `booking_amount`     DECIMAL(12,2) NOT NULL,
  `commission_percentage` DECIMAL(5,2) NOT NULL,
  `commission_amount`  DECIMAL(12,2) NOT NULL,
  `user_checkin_at`    TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  `owner_confirmed_at` TIMESTAMP     NULL DEFAULT NULL,
  `admin_recorded_at`  TIMESTAMP     NULL DEFAULT NULL,
  `checked_out_at`     TIMESTAMP     NULL DEFAULT NULL,
  `cancelled_at`       TIMESTAMP     NULL DEFAULT NULL,
  `cancellation_reason`TEXT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_checkin_booking` (`booking_id`),
  KEY `room_id`           (`room_id`),
  KEY `idx_booking`       (`booking_id`),
  KEY `idx_user`          (`user_id`),
  KEY `idx_owner`         (`owner_id`),
  KEY `idx_status`        (`status`),
  KEY `idx_property`      (`property_id`),
  KEY `idx_created`       (`user_checkin_at`),
  KEY `idx_assigned_room` (`assigned_room_id`),
  CONSTRAINT `check_ins_ibfk_1`         FOREIGN KEY (`booking_id`)       REFERENCES `bookings`   (`id`) ON DELETE CASCADE,
  CONSTRAINT `check_ins_ibfk_2`         FOREIGN KEY (`user_id`)          REFERENCES `users`      (`id`) ON DELETE CASCADE,
  CONSTRAINT `check_ins_ibfk_3`         FOREIGN KEY (`owner_id`)         REFERENCES `users`      (`id`) ON DELETE CASCADE,
  CONSTRAINT `check_ins_ibfk_4`         FOREIGN KEY (`property_id`)      REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `check_ins_ibfk_5`         FOREIGN KEY (`room_id`)          REFERENCES `room`       (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_checkins_assigned_room` FOREIGN KEY (`assigned_room_id`) REFERENCES `room`       (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 22. transactions  (depends on: bookings)
CREATE TABLE `transactions` (
  `id`                  INT           NOT NULL AUTO_INCREMENT,
  `booking_id`          INT           NOT NULL,
  `razorpay_order_id`   VARCHAR(255)  NOT NULL,
  `razorpay_payment_id` VARCHAR(255)  DEFAULT NULL,
  `amount`              DECIMAL(10,2) NOT NULL,
  `currency`            VARCHAR(10)   DEFAULT 'INR',
  `payment_status`      ENUM('PENDING','SUCCESS','FAILED','REFUNDED') DEFAULT 'PENDING',
  `payment_method`      VARCHAR(100)  DEFAULT NULL,
  `created_at`          TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_transactions_booking` (`booking_id`),
  KEY `idx_transactions_status`  (`payment_status`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 23. coupon_usages  (depends on: coupons, users, bookings)
CREATE TABLE `coupon_usages` (
  `id`              INT           NOT NULL AUTO_INCREMENT,
  `coupon_id`       INT           NOT NULL,
  `user_id`         INT           NOT NULL,
  `booking_id`      INT           NOT NULL,
  `discount_amount` DECIMAL(10,2) NOT NULL,
  `used_at`         TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `coupon_id`  (`coupon_id`),
  KEY `user_id`    (`user_id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `coupon_usages_ibfk_1` FOREIGN KEY (`coupon_id`)  REFERENCES `coupons`  (`id`),
  CONSTRAINT `coupon_usages_ibfk_2` FOREIGN KEY (`user_id`)    REFERENCES `users`    (`id`),
  CONSTRAINT `coupon_usages_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 24. reviews  (depends on: bookings, properties, users)
CREATE TABLE `reviews` (
  `id`              INT       NOT NULL AUTO_INCREMENT,
  `booking_id`      INT       NOT NULL,
  `property_id`     INT       NOT NULL,
  `room_id`         INT       NOT NULL,
  `user_id`         INT       NOT NULL,
  `rating`          INT       NOT NULL,
  `review_text`     TEXT,
  `review_status`   ENUM('VISIBLE','HIDDEN') DEFAULT 'VISIBLE',
  `created_at`      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `moderation_notes`TEXT,
  PRIMARY KEY (`id`),
  KEY `booking_id`            (`booking_id`),
  KEY `room_id`               (`room_id`),
  KEY `idx_reviews_property`  (`property_id`),
  KEY `idx_reviews_user`      (`user_id`),
  KEY `idx_reviews_rating`    (`rating`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`booking_id`)  REFERENCES `bookings`   (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_4` FOREIGN KEY (`user_id`)     REFERENCES `users`      (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 25. owner_earnings  (depends on: users, bookings, properties)
CREATE TABLE `owner_earnings` (
  `id`                    INT           NOT NULL AUTO_INCREMENT,
  `owner_id`              INT           NOT NULL,
  `booking_id`            INT           NOT NULL,
  `property_id`           INT           NOT NULL,
  `gross_amount`          DECIMAL(12,2) NOT NULL,
  `commission_percentage` DECIMAL(5,2)  NOT NULL,
  `commission_amount`     DECIMAL(12,2) NOT NULL,
  `net_earning`           DECIMAL(12,2) NOT NULL,
  `earning_status`        ENUM('PENDING','AVAILABLE','WITHDRAWN') DEFAULT 'PENDING',
  `created_at`            TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  `withdrawal_id`         INT           DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_id`    (`owner_id`),
  KEY `booking_id`  (`booking_id`),
  KEY `property_id` (`property_id`),
  CONSTRAINT `owner_earnings_ibfk_1` FOREIGN KEY (`owner_id`)    REFERENCES `users`      (`id`),
  CONSTRAINT `owner_earnings_ibfk_2` FOREIGN KEY (`booking_id`)  REFERENCES `bookings`   (`id`),
  CONSTRAINT `owner_earnings_ibfk_3` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- STEP 7: Tables that depend on `check_ins`
-- ============================================================

-- 26. admin_commissions  (depends on: check_ins, bookings, properties, users)
CREATE TABLE `admin_commissions` (
  `id`                       INT           NOT NULL AUTO_INCREMENT,
  `checkin_id`               INT           NOT NULL,
  `booking_id`               INT           NOT NULL,
  `property_id`              INT           NOT NULL,
  `owner_id`                 INT           NOT NULL,
  `commission_amount`        DECIMAL(12,2) NOT NULL,
  `payment_status`           ENUM('PENDING','PAID','CANCELLED') DEFAULT 'PENDING',
  `earned_at`                TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_requested_at`     TIMESTAMP     NULL DEFAULT NULL,
  `payment_confirmed_at`     TIMESTAMP     NULL DEFAULT NULL,
  `paid_at`                  TIMESTAMP     NULL DEFAULT NULL,
  `payment_method`           VARCHAR(50)   DEFAULT NULL,
  `payment_notes`            TEXT,
  `payment_proof_notes`      TEXT,
  `razorpay_order_id`        VARCHAR(100)  DEFAULT NULL,
  `razorpay_payment_id`      VARCHAR(100)  DEFAULT NULL,
  `razorpay_signature`       VARCHAR(255)  DEFAULT NULL,
  `razorpay_payment_status`  ENUM('CREATED','SUCCESS','FAILED') DEFAULT NULL,
  `razorpay_failure_reason`  TEXT,
  PRIMARY KEY (`id`),
  KEY `property_id`                              (`property_id`),
  KEY `owner_id`                                 (`owner_id`),
  KEY `idx_checkin`                              (`checkin_id`),
  KEY `idx_booking`                              (`booking_id`),
  KEY `idx_status`                               (`payment_status`),
  KEY `idx_earned`                               (`earned_at`),
  KEY `idx_payment_requested`                    (`payment_requested_at`),
  KEY `idx_payment_confirmed`                    (`payment_confirmed_at`),
  KEY `idx_admin_commissions_razorpay_order`     (`razorpay_order_id`),
  CONSTRAINT `admin_commissions_ibfk_1` FOREIGN KEY (`checkin_id`)  REFERENCES `check_ins`  (`id`) ON DELETE CASCADE,
  CONSTRAINT `admin_commissions_ibfk_2` FOREIGN KEY (`booking_id`)  REFERENCES `bookings`   (`id`) ON DELETE CASCADE,
  CONSTRAINT `admin_commissions_ibfk_3` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `admin_commissions_ibfk_4` FOREIGN KEY (`owner_id`)    REFERENCES `users`      (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- STEP 8: Tables that depend on `reviews`
-- ============================================================

-- 27. review_photos  (depends on: reviews)
CREATE TABLE `review_photos` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `review_id`  INT          NOT NULL,
  `image_url`  VARCHAR(500) NOT NULL,
  `created_at` TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_review_photos_review` (`review_id`),
  CONSTRAINT `fk_review_photos_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 28. review_reports  (depends on: reviews, users)
CREATE TABLE `review_reports` (
  `id`               INT          NOT NULL AUTO_INCREMENT,
  `review_id`        INT          NOT NULL,
  `reported_by`      INT          NOT NULL,
  `reason`           VARCHAR(255) NOT NULL,
  `additional_notes` TEXT,
  `report_status`    ENUM('PENDING','RESOLVED','REJECTED') DEFAULT 'PENDING',
  `created_at`       TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `review_id`   (`review_id`),
  KEY `reported_by` (`reported_by`),
  CONSTRAINT `review_reports_ibfk_1` FOREIGN KEY (`review_id`)   REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `review_reports_ibfk_2` FOREIGN KEY (`reported_by`) REFERENCES `users`   (`id`) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 29. review_responses  (depends on: reviews, users)
CREATE TABLE `review_responses` (
  `id`            INT       NOT NULL AUTO_INCREMENT,
  `review_id`     INT       NOT NULL,
  `owner_id`      INT       NOT NULL,
  `response_text` TEXT      NOT NULL,
  `created_at`    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `review_id` (`review_id`),
  KEY `owner_id`  (`owner_id`),
  CONSTRAINT `review_responses_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `review_responses_ibfk_2` FOREIGN KEY (`owner_id`)  REFERENCES `users`   (`id`) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- STEP 9: Tables that depend on `wallets`
-- ============================================================

-- 30. wallet_transactions  (depends on: wallets)
CREATE TABLE `wallet_transactions` (
  `id`               INT           NOT NULL AUTO_INCREMENT,
  `wallet_id`        INT           NOT NULL,
  `transaction_type` ENUM('CREDIT','DEBIT','REFUND','BOOKING_PAYMENT','OWNER_EARNING','WITHDRAWAL') NOT NULL,
  `amount`           DECIMAL(12,2) NOT NULL,
  `balance_before`   DECIMAL(12,2) NOT NULL,
  `balance_after`    DECIMAL(12,2) NOT NULL,
  `reference_id`     VARCHAR(255)  DEFAULT NULL,
  `description`      TEXT,
  `created_at`       TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wallet_transactions_wallet`  (`wallet_id`),
  KEY `idx_wallet_transactions_type`    (`transaction_type`),
  KEY `idx_wallet_transactions_created` (`created_at`),
  CONSTRAINT `wallet_transactions_ibfk_1` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 31. withdrawal_requests  (depends on: users, wallets)
CREATE TABLE `withdrawal_requests` (
  `id`                  INT           NOT NULL AUTO_INCREMENT,
  `owner_id`            INT           NOT NULL,
  `wallet_id`           INT           NOT NULL,
  `amount`              DECIMAL(15,2) NOT NULL,
  `bank_name`           VARCHAR(100)  DEFAULT NULL,
  `account_holder_name` VARCHAR(100)  NOT NULL,
  `account_number`      VARCHAR(50)   DEFAULT NULL,
  `ifsc_code`           VARCHAR(20)   DEFAULT NULL,
  `upi_id`              VARCHAR(100)  DEFAULT NULL,
  `withdrawal_status`   ENUM('PENDING','APPROVED','REJECTED','PAID') DEFAULT 'PENDING',
  `admin_notes`         TEXT,
  `created_at`          TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `owner_id`  (`owner_id`),
  KEY `wallet_id` (`wallet_id`),
  CONSTRAINT `withdrawal_requests_ibfk_1` FOREIGN KEY (`owner_id`)  REFERENCES `users`   (`id`) ON DELETE CASCADE,
  CONSTRAINT `withdrawal_requests_ibfk_2` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- 32. wishlist  (depends on: users, properties)
CREATE TABLE `wishlist` (
  `id`          INT       NOT NULL AUTO_INCREMENT,
  `user_id`     INT       NOT NULL,
  `property_id` INT       NOT NULL,
  `created_at`  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_property` (`user_id`,`property_id`),
  KEY `property_id` (`property_id`),
  CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`)     REFERENCES `users`      (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Done! 32 statements, run in order = complete database.
-- ============================================================

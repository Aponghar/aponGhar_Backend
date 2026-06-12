-- Create check-ins table for tracking owner-confirmed guest check-ins with commission tracking
CREATE TABLE IF NOT EXISTS check_ins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    owner_id INT NOT NULL,
    property_id INT NOT NULL,
    room_id INT NOT NULL,
    
    -- Check-in status: OWNER_CONFIRMED -> ADMIN_RECORDED
    status ENUM('USER_REQUEST', 'OWNER_CONFIRMED', 'ADMIN_RECORDED', 'CANCELLED') DEFAULT 'OWNER_CONFIRMED',
    
    -- Commission tracking
    booking_amount DECIMAL(12, 2) NOT NULL,
    commission_percentage DECIMAL(5, 2) NOT NULL,
    commission_amount DECIMAL(12, 2) NOT NULL,
    
    -- Timestamps
    user_checkin_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    owner_confirmed_at TIMESTAMP NULL,
    admin_recorded_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    
    -- Cancellation reason
    cancellation_reason TEXT NULL,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE CASCADE,
    
    UNIQUE KEY uq_checkin_booking (booking_id),
    INDEX idx_user (user_id),
    INDEX idx_owner (owner_id),
    INDEX idx_status (status),
    INDEX idx_property (property_id),
    INDEX idx_created (user_checkin_at)
);

-- Create admin earnings/commission table for tracking payments to admin
CREATE TABLE IF NOT EXISTS admin_commissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    checkin_id INT NOT NULL,
    booking_id INT NOT NULL,
    property_id INT NOT NULL,
    owner_id INT NOT NULL,
    
    commission_amount DECIMAL(12, 2) NOT NULL,
    payment_status ENUM('PENDING', 'PAID', 'CANCELLED') DEFAULT 'PENDING',
    
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    payment_method VARCHAR(50) NULL,
    payment_notes TEXT NULL,
    
    FOREIGN KEY (checkin_id) REFERENCES check_ins(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_checkin (checkin_id),
    INDEX idx_booking (booking_id),
    INDEX idx_status (payment_status),
    INDEX idx_earned (earned_at)
);

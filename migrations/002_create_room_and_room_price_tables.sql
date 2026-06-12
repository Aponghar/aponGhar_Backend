-- Create room table with room_id auto-generation
CREATE TABLE IF NOT EXISTS room (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id VARCHAR(50) UNIQUE NOT NULL,
    property_id INT NOT NULL,
    room_name VARCHAR(255) NOT NULL,
    room_type VARCHAR(100) NOT NULL,
    description TEXT,
    max_adults INT NOT NULL DEFAULT 1,
    max_children INT NOT NULL DEFAULT 0,
    bed_type VARCHAR(100),
    room_size VARCHAR(50),
    room_amenities JSON,
    room_benefits JSON,
    price_type ENUM('PER_NIGHT', 'HOURLY', 'BOTH') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_room_id (room_id),
    INDEX idx_property_id (property_id),
    INDEX idx_is_active (is_active)
);

-- Create room_price table
CREATE TABLE IF NOT EXISTS room_price (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id VARCHAR(50) NOT NULL,
    property_id INT NOT NULL,
    base_price DECIMAL(12, 2) NOT NULL,
    price_per_night DECIMAL(12, 2),
    price_3hours DECIMAL(12, 2),
    price_6hours DECIMAL(12, 2),
    price_9hours DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_room_id (room_id),
    INDEX idx_property_id (property_id)
);

CREATE TABLE IF NOT EXISTS room_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    inventory_date DATE NOT NULL,
    total_rooms INT NOT NULL DEFAULT 1,
    available_rooms INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_inventory_room
        FOREIGN KEY (room_id) REFERENCES room(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_room_inventory_date
        UNIQUE (room_id, inventory_date),
    INDEX idx_room_inventory_room (room_id),
    INDEX idx_room_inventory_date (inventory_date)
);

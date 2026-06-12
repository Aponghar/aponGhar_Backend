ALTER TABLE room
ADD COLUMN IF NOT EXISTS room_benefits JSON NULL AFTER room_amenities;

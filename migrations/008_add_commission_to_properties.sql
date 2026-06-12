-- =============================================
-- ADD COMMISSION PERCENTAGE TO PROPERTIES
-- =============================================

ALTER TABLE properties
ADD COLUMN commission_percentage DECIMAL(5, 2) DEFAULT 0
AFTER total_bookings;

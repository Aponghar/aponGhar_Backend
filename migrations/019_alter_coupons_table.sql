-- =============================================
-- ALTER COUPONS TABLE FOR GLOBAL ADMIN COUPONS AND ONCE PER USER USE
-- =============================================

ALTER TABLE coupons MODIFY property_id INT NULL;

ALTER TABLE coupons ADD COLUMN once_per_user BOOLEAN DEFAULT FALSE;

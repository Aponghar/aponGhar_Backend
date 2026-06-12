-- =============================================
-- ADD COMMISSION PAYMENT REQUEST TRACKING
-- =============================================
-- This migration adds support for tracking payment requests
-- for owner commissions with timestamps and payment proof notes

ALTER TABLE admin_commissions
ADD COLUMN payment_requested_at TIMESTAMP NULL DEFAULT NULL AFTER earned_at,
ADD COLUMN payment_confirmed_at TIMESTAMP NULL DEFAULT NULL AFTER payment_requested_at,
ADD COLUMN payment_proof_notes TEXT NULL AFTER payment_notes;

-- Add index for filtering by request status
CREATE INDEX idx_payment_requested ON admin_commissions(payment_requested_at);
CREATE INDEX idx_payment_confirmed ON admin_commissions(payment_confirmed_at);

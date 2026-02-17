-- Migration to change cost column from integer to numeric for better precision
-- This allows storing fractional cents (e.g., 0.01 cents = $0.0001)

ALTER TABLE requests 
ALTER COLUMN cost TYPE numeric(10, 2);

-- Update description: cost is now in cents with 2 decimal places
-- Example: 1.50 = 1.5 cents = $0.015
-- Example: 0.01 = 0.01 cents = $0.0001


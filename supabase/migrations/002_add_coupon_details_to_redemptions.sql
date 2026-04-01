-- Function to generate a 4-digit numeric coupon code
CREATE OR REPLACE FUNCTION generate_coupon_code()
RETURNS VARCHAR(4) AS $$
BEGIN
  RETURN LPAD(FLOOR(random() * 10000)::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Add coupon_code, expires_at, and products columns to the redemptions table
-- Assuming 'redemptions' table already exists and has user_id, store_id, offer_id
ALTER TABLE redemptions
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(4) DEFAULT generate_coupon_code(),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS products JSONB; -- To store linked product IDs

-- Create an index on coupon_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_redemptions_coupon_code ON redemptions (coupon_code);

-- Add telegram_id column to users table for Telegram integration
ALTER TABLE users ADD COLUMN telegram_id BIGINT UNIQUE;

-- Add comment to the column
COMMENT ON COLUMN users.telegram_id IS 'Telegram user ID for authentication';
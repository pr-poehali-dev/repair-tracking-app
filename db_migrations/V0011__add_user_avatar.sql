-- Add avatar_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add comment to column
COMMENT ON COLUMN users.avatar_url IS 'URL to user avatar image in S3 storage';

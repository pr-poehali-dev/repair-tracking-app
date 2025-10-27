-- Create table for order media files (photos/videos)
CREATE TABLE IF NOT EXISTS order_media (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(20) NOT NULL DEFAULT 'image',
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries by order_id
CREATE INDEX IF NOT EXISTS idx_order_media_order_id ON order_media(order_id);

-- Create index for faster queries by uploaded_at
CREATE INDEX IF NOT EXISTS idx_order_media_uploaded_at ON order_media(uploaded_at);

-- Add comment to table
COMMENT ON TABLE order_media IS 'Media files (photos/videos) attached to repair orders for documentation';

-- Add comments to columns
COMMENT ON COLUMN order_media.file_type IS 'Type of media: image or video';
COMMENT ON COLUMN order_media.file_url IS 'Public URL to the file in S3 storage';
COMMENT ON COLUMN order_media.file_size IS 'File size in bytes';

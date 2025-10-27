-- Create table for order chat messages
CREATE TABLE IF NOT EXISTS order_chat_messages (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries by order_id
CREATE INDEX IF NOT EXISTS idx_order_chat_order_id ON order_chat_messages(order_id);

-- Create index for faster queries by timestamp
CREATE INDEX IF NOT EXISTS idx_order_chat_timestamp ON order_chat_messages(timestamp);

-- Add comment to table
COMMENT ON TABLE order_chat_messages IS 'Chat messages for order discussions between team members';

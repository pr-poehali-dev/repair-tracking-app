-- Add indexes for performance optimization

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_master ON orders(master);

-- Order users table indexes  
CREATE INDEX IF NOT EXISTS idx_order_users_user_id ON order_users(user_id);
CREATE INDEX IF NOT EXISTS idx_order_users_order_id ON order_users(order_id);
CREATE INDEX IF NOT EXISTS idx_order_users_composite ON order_users(user_id, order_id);

-- Order chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_order_id ON order_chat_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON order_chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_message_search ON order_chat_messages USING gin(to_tsvector('russian', message));

-- Order media indexes
CREATE INDEX IF NOT EXISTS idx_media_order_id ON order_media(order_id);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_at ON order_media(uploaded_at DESC);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
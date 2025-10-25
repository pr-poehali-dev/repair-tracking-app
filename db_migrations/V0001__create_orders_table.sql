CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_address TEXT NOT NULL,
  client_phone VARCHAR(50) NOT NULL,
  device_type VARCHAR(100) NOT NULL,
  device_model VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100) NOT NULL,
  issue TEXT NOT NULL,
  appearance TEXT NOT NULL,
  accessories TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'received',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  repair_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_time VARCHAR(10) NOT NULL,
  price DECIMAL(10, 2),
  master VARCHAR(255),
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_client_name ON orders(client_name);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
-- Таблица для хранения медиафайлов заказов
CREATE TABLE IF NOT EXISTS order_media (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('image', 'video')),
  file_name TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- Индекс для быстрого поиска медиафайлов по заказу
CREATE INDEX IF NOT EXISTS idx_order_media_order_id ON order_media(order_id);

-- Индекс для фильтрации по типу файла
CREATE INDEX IF NOT EXISTS idx_order_media_file_type ON order_media(file_type);
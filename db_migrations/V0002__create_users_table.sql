CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

INSERT INTO users (username, password, full_name, role) VALUES
  ('director', 'director123', 'Директор Иван Петрович', 'director'),
  ('master1', 'master123', 'Петров Алексей', 'master'),
  ('master2', 'master123', 'Иванов Дмитрий', 'master'),
  ('accountant', 'accountant123', 'Бухгалтер Ольга Сергеевна', 'accountant'),
  ('warranty', 'warranty123', 'Менеджер Гарантия Мария', 'warranty_manager'),
  ('parts', 'parts123', 'Менеджер Запчасти Андрей', 'parts_manager'),
  ('reception', 'reception123', 'Сидорова Марина', 'reception_manager')
ON CONFLICT (username) DO NOTHING;
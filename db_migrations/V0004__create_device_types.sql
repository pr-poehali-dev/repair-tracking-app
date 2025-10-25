CREATE TABLE IF NOT EXISTS t_p43469238_repair_tracking_app.device_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_device_types_category ON t_p43469238_repair_tracking_app.device_types(category);

INSERT INTO t_p43469238_repair_tracking_app.device_types (name, category) VALUES
('Холодильник', 'Крупная бытовая техника'),
('Стиральная машина', 'Крупная бытовая техника'),
('Микроволновка', 'Кухонная техника'),
('Посудомоечная машина', 'Крупная бытовая техника'),
('Телевизор', 'Электроника'),
('Пылесос', 'Мелкая бытовая техника'),
('Пылесос моющий', 'Мелкая бытовая техника'),
('Духовой шкаф', 'Встраиваемая техника'),
('Варочная поверхность', 'Встраиваемая техника'),
('Вытяжка', 'Встраиваемая техника'),
('Мясорубка', 'Кухонная техника'),
('Кухонный комбайн', 'Кухонная техника'),
('Телефон', 'Электроника'),
('Системный блок', 'Компьютерная техника'),
('Монитор', 'Компьютерная техника'),
('Ноутбук', 'Компьютерная техника'),
('Планшет', 'Электроника')
ON CONFLICT (name) DO NOTHING;
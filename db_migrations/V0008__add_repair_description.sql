-- Добавление поля для описания выполненного ремонта
ALTER TABLE t_p43469238_repair_tracking_app.orders
ADD COLUMN repair_description text;

COMMENT ON COLUMN t_p43469238_repair_tracking_app.orders.repair_description IS 'Описание выполненного ремонта (детали, замененные части, работы)';
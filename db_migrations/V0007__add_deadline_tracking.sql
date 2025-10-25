-- Добавление полей для контроля сроков ремонта
ALTER TABLE t_p43469238_repair_tracking_app.orders
ADD COLUMN status_deadline timestamp without time zone,
ADD COLUMN status_changed_at timestamp without time zone DEFAULT now(),
ADD COLUMN is_overdue boolean DEFAULT false;

-- Создание таблицы для хранения истории смены статусов
CREATE TABLE IF NOT EXISTS t_p43469238_repair_tracking_app.status_history (
  id SERIAL PRIMARY KEY,
  order_id character varying(50) NOT NULL,
  old_status character varying(50),
  new_status character varying(50) NOT NULL,
  changed_at timestamp without time zone NOT NULL DEFAULT now(),
  changed_by character varying(255),
  duration_hours integer,
  was_overdue boolean DEFAULT false
);

-- Создание индекса для быстрого поиска истории по заказу
CREATE INDEX idx_status_history_order_id ON t_p43469238_repair_tracking_app.status_history(order_id);

COMMENT ON COLUMN t_p43469238_repair_tracking_app.orders.status_deadline IS 'Крайний срок для текущего статуса ремонта';
COMMENT ON COLUMN t_p43469238_repair_tracking_app.orders.status_changed_at IS 'Время последней смены статуса';
COMMENT ON COLUMN t_p43469238_repair_tracking_app.orders.is_overdue IS 'Просрочен ли текущий статус';
COMMENT ON TABLE t_p43469238_repair_tracking_app.status_history IS 'История смены статусов заказов с контролем длительности';
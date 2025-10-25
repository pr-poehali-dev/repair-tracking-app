CREATE TABLE IF NOT EXISTS t_p43469238_repair_tracking_app.order_users (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES t_p43469238_repair_tracking_app.orders(id),
    user_id INTEGER NOT NULL REFERENCES t_p43469238_repair_tracking_app.users(id),
    role VARCHAR(50) NOT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(order_id, user_id)
);

CREATE INDEX idx_order_users_order_id ON t_p43469238_repair_tracking_app.order_users(order_id);
CREATE INDEX idx_order_users_user_id ON t_p43469238_repair_tracking_app.order_users(user_id);

INSERT INTO t_p43469238_repair_tracking_app.order_users (order_id, user_id, role)
SELECT o.id, u.id, 'master'
FROM t_p43469238_repair_tracking_app.orders o
CROSS JOIN t_p43469238_repair_tracking_app.users u
WHERE u.role = 'director'
ON CONFLICT (order_id, user_id) DO NOTHING;
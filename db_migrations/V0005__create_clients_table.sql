CREATE TABLE IF NOT EXISTS t_p43469238_repair_tracking_app.clients (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    email VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(phone)
);

CREATE INDEX idx_clients_full_name ON t_p43469238_repair_tracking_app.clients(full_name);
CREATE INDEX idx_clients_phone ON t_p43469238_repair_tracking_app.clients(phone);
CREATE INDEX idx_clients_address ON t_p43469238_repair_tracking_app.clients(address);

CREATE TABLE IF NOT EXISTS t_p43469238_repair_tracking_app.client_devices (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES t_p43469238_repair_tracking_app.clients(id),
    device_type VARCHAR(100) NOT NULL,
    device_model VARCHAR(100),
    serial_number VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_devices_client_id ON t_p43469238_repair_tracking_app.client_devices(client_id);
CREATE INDEX idx_client_devices_serial_number ON t_p43469238_repair_tracking_app.client_devices(serial_number);

INSERT INTO t_p43469238_repair_tracking_app.clients (full_name, phone, address)
SELECT DISTINCT 
    client_name,
    client_phone,
    client_address
FROM t_p43469238_repair_tracking_app.orders
WHERE client_phone IS NOT NULL AND client_phone != ''
ON CONFLICT (phone) DO NOTHING;

INSERT INTO t_p43469238_repair_tracking_app.client_devices (client_id, device_type, device_model, serial_number)
SELECT 
    c.id,
    o.device_type,
    o.device_model,
    o.serial_number
FROM t_p43469238_repair_tracking_app.orders o
INNER JOIN t_p43469238_repair_tracking_app.clients c ON c.phone = o.client_phone
WHERE o.serial_number IS NOT NULL AND o.serial_number != ''
ON CONFLICT DO NOTHING;
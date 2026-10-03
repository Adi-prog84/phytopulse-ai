-- ========================================================
-- PhytoPulse AI - Seed Data (MySQL 8.0+)
-- Problem Statement: SIH26180 | Team: PYTHOPULSE
-- ========================================================

USE phytopulse_db;

-- Clear previous data in correct order
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE alerts;
TRUNCATE TABLE irrigation_events;
TRUNCATE TABLE plant_health;
TRUNCATE TABLE sensor_readings;
TRUNCATE TABLE devices;
TRUNCATE TABLE system_settings;
TRUNCATE TABLE farms;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Demo User (Password: Demo@123)
-- Hash generated using werkzeug scrypt
INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (
    1,
    'Dr. Adithya V (Agri-Technologist)',
    'demo@phytopulse.ai',
    'scrypt:32768:8:1$z1civjMirDCwu3Ta$75db8afd72e2d3e4978337894ea4ef7aca7207d88d3d87e4f0f97d775ac1a85db3d382ed24fd79d12dfb2cde0476bf598fa52d13fbdac334b1458ad189384ad6',
    'lead_farmer',
    NOW()
);

-- 2. Demo Farm
INSERT INTO farms (id, user_id, farm_name, location, area, crop_type, created_at) VALUES (
    1,
    1,
    'Green Valley Smart Farm',
    'Mysuru, Karnataka, India',
    '2.5 acres',
    'Tomato (Solanum lycopersicum)',
    NOW()
);

-- 3. System Settings
INSERT INTO system_settings (farm_id, moisture_threshold, auto_irrigation, simulation_mode) VALUES (
    1,
    35.0,
    TRUE,
    TRUE
);

-- 4. Simulated Hardware Devices (Virtual Device - Simulation Mode)
INSERT INTO devices (farm_id, device_name, device_type, status, last_seen, signal_strength) VALUES
(1, 'ESP32-S3 Core Hub', 'Gateway Microcontroller', 'ONLINE', NOW(), -58),
(1, 'ESP32-CAM Vision Node', 'Canopy Camera & AI Node', 'ONLINE', NOW(), -64),
(1, 'Soil Moisture Sensor Pro', 'Capacitive Sensor v1.2', 'ONLINE', NOW(), -62),
(1, 'DHT22 Climate Sensor', 'Ambient Temp & Humidity', 'ONLINE', NOW(), -60),
(1, 'Rain Sensor Array', 'Digital/Analog Precipitation', 'ONLINE', NOW(), -65),
(1, 'Dual Channel Relay Module', 'Optocoupled 5V Relay', 'ONLINE', NOW(), -55),
(1, '12V DC Irrigation Pump', 'High-Pressure Submersible', 'ONLINE', NOW(), -52),
(1, 'OLED Local Display', '0.96 inch I2C 128x64 HUD', 'ONLINE', NOW(), -50);

-- 5. Historical Sensor Readings (Last 24 hours simulation)
INSERT INTO sensor_readings (farm_id, soil_moisture, temperature, humidity, rainfall_detected, timestamp) VALUES
(1, 56.2, 24.1, 74.0, FALSE, DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(1, 55.8, 23.5, 76.0, FALSE, DATE_SUB(NOW(), INTERVAL 20 HOUR)),
(1, 54.9, 25.2, 71.0, FALSE, DATE_SUB(NOW(), INTERVAL 16 HOUR)),
(1, 53.4, 28.6, 64.0, FALSE, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(1, 51.7, 30.1, 59.0, FALSE, DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(1, 50.2, 29.4, 62.0, FALSE, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(1, 48.5, 28.0, 66.0, FALSE, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 55.0, 27.0, 68.0, FALSE, NOW());

-- 6. Initial Plant Health History
INSERT INTO plant_health (farm_id, image_path, health_score, health_status, stress_level, detected_issue, confidence, recommendation, timestamp) VALUES
(1, 'uploads/sample_healthy.jpg', 92, 'Healthy', 'Low', 'No significant stress detected', 91.5, 'Continue monitoring soil moisture and maintain current irrigation conditions.', NOW()),
(1, 'uploads/sample_prev.jpg', 88, 'Healthy', 'Low', 'Optimal chlorophyll density and leaf turgor', 89.0, 'Leaf transpiration balance is normal. Maintain scheduled sensor cycles.', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 7. Past Irrigation Events
INSERT INTO irrigation_events (farm_id, soil_moisture, rainfall_detected, plant_health, decision, pump_status, duration, reason, timestamp) VALUES
(1, 32.0, FALSE, 85, 'IRRIGATE', 'COMPLETED', 15, 'Scheduled morning cycle - Soil moisture dipped to 32%', DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(1, 33.5, FALSE, 88, 'IRRIGATE', 'COMPLETED', 12, 'Automated threshold adjustment triggered by root-zone sensor', DATE_SUB(NOW(), INTERVAL 42 HOUR));

-- 8. Initial Alerts
INSERT INTO alerts (farm_id, type, severity, message, is_read, timestamp) VALUES
(1, 'SYSTEM_INITIALIZED', 'INFO', 'PhytoPulse AI core online in DEMO / SIMULATION MODE. Virtual device telemetry active.', FALSE, NOW()),
(1, 'HEALTHY_CANOPY', 'INFO', 'Canopy assessment verified 92% health score for Tomato crop block A.', FALSE, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 'OPTIMAL_SOIL', 'INFO', 'Root-zone moisture stable at 55.0%. Autonomous irrigation on standby.', TRUE, DATE_SUB(NOW(), INTERVAL 3 HOUR));

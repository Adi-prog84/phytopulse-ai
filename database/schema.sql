-- ========================================================
-- PhytoPulse AI - Database Schema (MySQL 8.0+)
-- Problem Statement: SIH26180 | Team: PYTHOPULSE
-- Theme: Smart Agriculture & Climate Resilience
-- ========================================================

CREATE DATABASE IF NOT EXISTS phytopulse_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE phytopulse_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'farmer',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Farms Table
CREATE TABLE IF NOT EXISTS farms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    farm_name VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    area VARCHAR(50) NOT NULL,
    crop_type VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_farms_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_farms_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Sensor Readings Table
CREATE TABLE IF NOT EXISTS sensor_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farm_id INT NOT NULL,
    soil_moisture FLOAT NOT NULL,
    temperature FLOAT NOT NULL,
    humidity FLOAT NOT NULL,
    rainfall_detected BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sensors_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    INDEX idx_sensors_farm_timestamp (farm_id, timestamp DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Plant Health Analysis Table
CREATE TABLE IF NOT EXISTS plant_health (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farm_id INT NOT NULL,
    image_path VARCHAR(255) NULL,
    health_score INT NOT NULL,
    health_status VARCHAR(50) NOT NULL,
    stress_level VARCHAR(50) NOT NULL,
    detected_issue VARCHAR(255) NOT NULL,
    confidence FLOAT NOT NULL,
    recommendation TEXT NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plant_health_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    INDEX idx_plant_health_farm_timestamp (farm_id, timestamp DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Irrigation Events Table
CREATE TABLE IF NOT EXISTS irrigation_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farm_id INT NOT NULL,
    soil_moisture FLOAT NOT NULL,
    rainfall_detected BOOLEAN NOT NULL DEFAULT FALSE,
    plant_health INT NULL,
    decision VARCHAR(50) NOT NULL,
    pump_status VARCHAR(20) NOT NULL,
    duration INT NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_irrigation_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    INDEX idx_irrigation_farm_timestamp (farm_id, timestamp DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farm_id INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerts_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    INDEX idx_alerts_farm_isread (farm_id, is_read, timestamp DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Devices Table (Virtual / Physical Hardware)
CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farm_id INT NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    last_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    signal_strength INT NOT NULL DEFAULT -65,
    CONSTRAINT fk_devices_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    INDEX idx_devices_farm (farm_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farm_id INT NOT NULL UNIQUE,
    moisture_threshold FLOAT NOT NULL DEFAULT 35.0,
    auto_irrigation BOOLEAN NOT NULL DEFAULT TRUE,
    simulation_mode BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_settings_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

# PhytoPulse AI - Database Documentation

## Database Name
`phytopulse_db` (MySQL 8.0+)

## Schema Architecture

1. **`users`**
   - Stores authentication accounts, names, hashed passwords (`werkzeug.security` scrypt), roles (`admin`, `lead_farmer`, `observer`), and creation timestamps.
   - Demo User: `demo@phytopulse.ai` / `Demo@123`

2. **`farms`**
   - Represents physical farm holdings associated with users.
   - Fields: `farm_name`, `location` (e.g., Mysuru, Karnataka), `area` (e.g., 2.5 acres), `crop_type` (e.g., Tomato).

3. **`sensor_readings`**
   - High-frequency telemetry log from IoT sensor nodes (or software simulator).
   - Fields: `soil_moisture` (%), `temperature` (°C), `humidity` (%), `rainfall_detected` (boolean), `timestamp`.
   - Indexed on `(farm_id, timestamp DESC)` for fast dashboard & analytics aggregation.

4. **`plant_health`**
   - Visual AI canopy inspection records.
   - Fields: `image_path`, `health_score` (0-100%), `health_status`, `stress_level`, `detected_issue`, `confidence` (%), `recommendation`, `timestamp`.

5. **`irrigation_events`**
   - Complete ledger of automated & manual irrigation actuations.
   - Fields: `soil_moisture`, `rainfall_detected`, `plant_health`, `decision`, `pump_status`, `duration` (mins), `reason`, `timestamp`.

6. **`alerts`**
   - System alert bus for environmental anomalies, rain overrides, critical moisture thresholds, and pump activations.
   - Severities: `INFO`, `WARNING`, `CRITICAL`.
   - Indexed on `(farm_id, is_read, timestamp DESC)`.

7. **`devices`**
   - Inventory and heartbeat tracker for physical or virtual ESP32 hardware:
     - `ESP32-S3 Core Hub`
     - `ESP32-CAM Vision Node`
     - `Soil Moisture Sensor Pro`
     - `DHT22 Climate Sensor`
     - `Rain Sensor Array`
     - `Dual Channel Relay Module`
     - `12V DC Irrigation Pump`
     - `OLED Local Display`

8. **`system_settings`**
   - Farm-specific operational thresholds:
     - `moisture_threshold`: Root-zone moisture cutoff below which irrigation triggers (default 35%).
     - `auto_irrigation`: Autonomous loop flag.
     - `simulation_mode`: Explicit flag denoting virtual hardware telemetry.

## Initialization Commands

```bash
# In MySQL client:
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

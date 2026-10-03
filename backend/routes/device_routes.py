from datetime import datetime
from flask import Blueprint, request, current_app
from extensions import db
from models.device import Device
from models.sensor import SensorReading
from services.decision_engine import IrrigationDecisionEngine
from services.simulator_service import SensorSimulatorService
from utils.helpers import api_response, api_error

device_bp = Blueprint('devices', __name__, url_prefix='/api/devices')

DEVICE_METADATA = {
    'ESP32-S3 Core Hub': {
        'spec': 'Xtensa Dual-Core 32-bit LX7 @ 240MHz, 8MB PSRAM, Wi-Fi 4 + BLE 5',
        'pin_mapping': 'SDA: GPIO 21, SCL: GPIO 22, ADC1: GPIO 34, Relay: GPIO 25',
        'power_source': '12V Solar Panel + 18650 LiFePO4 Pack (3.7V / 5200mAh)',
        'battery_level': 94,
        'firmware': 'v1.4.2-idf5.1'
    },
    'ESP32-CAM Vision Node': {
        'spec': 'OV2640 2MP Camera Sensor, JPEG Compression, MicroSD Cache',
        'pin_mapping': 'D0-D7, PCLK: GPIO 22, XCLK: GPIO 0, Flash: GPIO 4',
        'power_source': '5V Regulated Step-Down Bus',
        'battery_level': 91,
        'firmware': 'v2.1.0-cam'
    },
    'Soil Moisture Sensor Pro': {
        'spec': 'Capacitive v1.2 Corrosion Resistant Analog Soil Probe',
        'pin_mapping': 'AOUT -> ESP32 GPIO 34 (ADC1_CH6)',
        'power_source': '3.3V Ultra-Low Noise LDO',
        'battery_level': 100,
        'firmware': 'Analog-Passive'
    },
    'DHT22 Climate Sensor': {
        'spec': 'Digital Relative Humidity & Calibrated Thermistor',
        'pin_mapping': 'DATA -> ESP32 GPIO 18 (10k pull-up)',
        'power_source': '3.3V Rail',
        'battery_level': 100,
        'firmware': '1-Wire Digital'
    },
    'Rain Sensor Array': {
        'spec': 'Gold-Plated Surface Moisture Comparator LM393',
        'pin_mapping': 'DOUT -> ESP32 GPIO 19, AOUT -> GPIO 35',
        'power_source': '5V Bus',
        'battery_level': 100,
        'firmware': 'Digital Trigger'
    },
    'Dual Channel Relay Module': {
        'spec': 'Optocoupled 10A 250VAC / 30VDC Mechanical Switch',
        'pin_mapping': 'IN1 -> ESP32 GPIO 25 (Active LOW)',
        'power_source': '5V External Opto Supply',
        'battery_level': 100,
        'firmware': 'GPIO Actuator'
    },
    '12V DC Irrigation Pump': {
        'spec': 'Submersible 240 L/H Brushless Water Centrifugal Pump',
        'pin_mapping': 'Driven via Relay Channel 1',
        'power_source': '12V 5A Field Battery Rail',
        'battery_level': 88,
        'firmware': 'Actuator'
    },
    'OLED Local Display': {
        'spec': '0.96 inch 128x64 Blue/Yellow SSD1306 Graphic Display',
        'pin_mapping': 'I2C Bus (SDA: 21, SCL: 22)',
        'power_source': '3.3V Logic Rail',
        'battery_level': 100,
        'firmware': 'SSD1306-I2C'
    }
}

@device_bp.route('', methods=['GET'])
def get_devices():
    farm_id = request.args.get('farm_id', 1, type=int)
    devices = Device.query.filter_by(farm_id=farm_id).all()

    results = []
    for d in devices:
        item = d.to_dict()
        meta = DEVICE_METADATA.get(d.device_name, {})
        item.update(meta)
        item['is_simulated'] = True
        item['simulation_label'] = "Virtual Device — Simulation Mode"
        results.append(item)

    return api_response(results, 'Devices fetched')

@device_bp.route('/<int:device_id>', methods=['GET'])
def get_device(device_id):
    device = Device.query.get(device_id)
    if not device:
        return api_error('Device not found', 404)
    item = device.to_dict()
    item.update(DEVICE_METADATA.get(device.device_name, {}))
    item['is_simulated'] = True
    return api_response(item, 'Device details')

# ========================================================
# PHYSICAL HARDWARE INGESTION ENDPOINTS (FOR FUTURE ESP32)
# ========================================================

@device_bp.route('/sensor-data', methods=['POST'])
def receive_hardware_sensor_data():
    """
    ESP32-S3 Hardware Ingestion API
    Receives JSON telemetry from real ESP32 in the field and routes into
    the same Decision Engine and Database as the simulator.
    """
    data = request.get_json() or {}
    device_id = data.get('device_id', 'ESP32-S3-FIELD')
    farm_id = data.get('farm_id', 1)
    
    soil_moisture = data.get('soil_moisture')
    temperature = data.get('temperature')
    humidity = data.get('humidity')
    rain_detected = data.get('rain_detected', False)

    if soil_moisture is None or temperature is None or humidity is None:
        return api_error('Missing required sensor readings (soil_moisture, temperature, humidity)', 400)

    # 1. Record reading in MySQL
    reading = SensorReading(
        farm_id=farm_id,
        soil_moisture=float(soil_moisture),
        temperature=float(temperature),
        humidity=float(humidity),
        rainfall_detected=bool(rain_detected),
        timestamp=datetime.utcnow()
    )
    db.session.add(reading)

    # 2. Update device heartbeat
    dev = Device.query.filter_by(farm_id=farm_id, device_name='ESP32-S3 Core Hub').first()
    if dev:
        dev.last_seen = datetime.utcnow()
        dev.status = 'ONLINE'

    db.session.commit()

    # 3. Process via Decision Engine
    decision_result = IrrigationDecisionEngine.process_and_act(
        farm_id=farm_id,
        soil_moisture=soil_moisture,
        temperature=temperature,
        humidity=humidity,
        rain_detected=rain_detected
    )

    # Return decision directly to ESP32 so it can trigger relay locally
    return api_response({
        "status": "ACCEPTED",
        "device_id": device_id,
        "pump_command": decision_result["pump_status"],
        "reason": decision_result["reason"],
        "duration_minutes": decision_result["recommended_duration"],
        "timestamp": datetime.utcnow().isoformat()
    }, 'Sensor telemetry processed successfully')

@device_bp.route('/heartbeat', methods=['POST'])
def hardware_heartbeat():
    """Heartbeat endpoint for field nodes"""
    data = request.get_json() or {}
    device_name = data.get('device_name')
    farm_id = data.get('farm_id', 1)
    signal = data.get('signal_strength', -60)

    if not device_name:
        return api_error('device_name is required', 400)

    device = Device.query.filter_by(farm_id=farm_id, device_name=device_name).first()
    if not device:
        device = Device(
            farm_id=farm_id,
            device_name=device_name,
            device_type=data.get('device_type', 'Generic IoT Node'),
            status='ONLINE',
            signal_strength=signal
        )
        db.session.add(device)
    else:
        device.status = 'ONLINE'
        device.last_seen = datetime.utcnow()
        device.signal_strength = signal

    db.session.commit()
    return api_response(device.to_dict(), 'Heartbeat registered')

@device_bp.route('/pump', methods=['POST'])
def hardware_pump_callback():
    """Callback from ESP32 confirming physical relay status"""
    data = request.get_json() or {}
    farm_id = data.get('farm_id', 1)
    pump_state = data.get('pump_state', 'OFF').upper()
    confirmation_token = data.get('token', 'N/A')

    return api_response({
        "farm_id": farm_id,
        "acknowledged_state": pump_state,
        "timestamp": datetime.utcnow().isoformat()
    }, 'Pump status acknowledged by backend')

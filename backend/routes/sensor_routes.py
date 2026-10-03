from flask import Blueprint, request
from extensions import db
from models.sensor import SensorReading
from models.setting import SystemSetting
from utils.helpers import api_response

sensor_bp = Blueprint('sensors', __name__, url_prefix='/api/sensors')

@sensor_bp.route('/latest', methods=['GET'])
def get_latest_sensor():
    farm_id = request.args.get('farm_id', 1, type=int)
    reading = SensorReading.query.filter_by(farm_id=farm_id).order_by(SensorReading.id.desc()).first()

    settings = SystemSetting.query.filter_by(farm_id=farm_id).first()
    moisture_threshold = settings.moisture_threshold if settings else 35.0

    if not reading:
        return api_response({
            "soil_moisture": 55.0,
            "temperature": 27.0,
            "humidity": 68.0,
            "rainfall_detected": False,
            "timestamp": None,
            "moisture_status": "Optimal",
            "temperature_status": "Normal",
            "humidity_status": "Comfortable",
            "rain_status": "No Rain"
        }, 'Default sensor reading')

    data = reading.to_dict()

    # Calculate status badges
    sm = data["soil_moisture"]
    if sm < 20:
        moisture_status = "Critically Dry"
    elif sm < moisture_threshold:
        moisture_status = "Low"
    elif sm <= 65:
        moisture_status = "Optimal"
    else:
        moisture_status = "Saturated"

    temp = data["temperature"]
    if temp >= 38.0:
        temp_status = "Extreme Heat"
    elif temp >= 32.0:
        temp_status = "Elevated"
    elif temp >= 20.0:
        temp_status = "Optimal"
    else:
        temp_status = "Cool"

    hum = data["humidity"]
    if hum > 80:
        hum_status = "High / Humid"
    elif hum >= 50:
        hum_status = "Optimal"
    else:
        hum_status = "Dry Air"

    data["moisture_status"] = moisture_status
    data["temperature_status"] = temp_status
    data["humidity_status"] = hum_status
    data["rain_status"] = "Rain Detected" if data["rainfall_detected"] else "No Rain"
    data["moisture_threshold"] = moisture_threshold

    return api_response(data, 'Latest sensor reading')

@sensor_bp.route('/history', methods=['GET'])
def get_sensor_history():
    farm_id = request.args.get('farm_id', 1, type=int)
    limit = request.args.get('limit', 25, type=int)
    
    # Fetch most recent records
    readings = SensorReading.query.filter_by(farm_id=farm_id).order_by(SensorReading.timestamp.desc()).limit(limit).all()
    # Reverse so charts display left-to-right chronologically
    readings.reverse()

    results = []
    for r in readings:
        d = r.to_dict()
        # Formatted short time for graph X axis
        if r.timestamp:
            d["time_formatted"] = r.timestamp.strftime("%H:%M:%S")
        else:
            d["time_formatted"] = "--"
        results.append(d)

    return api_response(results, 'Sensor history')

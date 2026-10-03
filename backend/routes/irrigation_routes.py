from flask import Blueprint, request, current_app
from extensions import db
from models.irrigation import IrrigationEvent
from models.sensor import SensorReading
from models.plant_health import PlantHealth
from models.setting import SystemSetting
from services.decision_engine import IrrigationDecisionEngine
from services.simulator_service import SensorSimulatorService
from utils.helpers import api_response, api_error

irrigation_bp = Blueprint('irrigation', __name__, url_prefix='/api/irrigation')

@irrigation_bp.route('/status', methods=['GET'])
def get_irrigation_status():
    farm_id = request.args.get('farm_id', 1, type=int)

    # 1. Fetch settings
    settings = SystemSetting.query.filter_by(farm_id=farm_id).first()
    moisture_threshold = settings.moisture_threshold if settings else 35.0
    auto_irrigation = settings.auto_irrigation if settings else True

    # 2. Latest sensor reading
    latest_sensor = SensorReading.query.filter_by(farm_id=farm_id).order_by(SensorReading.id.desc()).first()
    soil_moisture = latest_sensor.soil_moisture if latest_sensor else 55.0
    temperature = latest_sensor.temperature if latest_sensor else 27.0
    humidity = latest_sensor.humidity if latest_sensor else 68.0
    rainfall_detected = latest_sensor.rainfall_detected if latest_sensor else False

    # 3. Latest plant health
    latest_ph = PlantHealth.query.filter_by(farm_id=farm_id).order_by(PlantHealth.id.desc()).first()
    plant_health = latest_ph.health_score if latest_ph else 90
    stress_level = latest_ph.stress_level if latest_ph else "Low"

    # 4. Latest irrigation event to get current pump status
    last_event = IrrigationEvent.query.filter_by(farm_id=farm_id).order_by(IrrigationEvent.id.desc()).first()
    current_pump = last_event.pump_status if last_event else "OFF"

    # Evaluate decision logic
    eval_res = IrrigationDecisionEngine.evaluate(
        soil_moisture=soil_moisture,
        moisture_threshold=moisture_threshold,
        temperature=temperature,
        humidity=humidity,
        rain_detected=rainfall_detected,
        plant_health=plant_health,
        stress_level=stress_level
    )

    # If auto mode is ON, effective pump status tracks decision engine
    effective_pump = eval_res["pump_status"] if auto_irrigation else current_pump

    return api_response({
        "pump_status": effective_pump,
        "auto_irrigation": auto_irrigation,
        "decision": eval_res["decision"],
        "priority": eval_res["priority"],
        "reason": eval_res["reason"],
        "recommended_duration": eval_res["recommended_duration"],
        "soil_moisture": soil_moisture,
        "moisture_threshold": moisture_threshold,
        "rainfall_detected": rainfall_detected,
        "plant_health": plant_health,
        "stress_level": stress_level,
        "temperature": temperature,
        "humidity": humidity,
        "water_saved_liters": 680,
        "total_events_today": IrrigationEvent.query.filter_by(farm_id=farm_id).count()
    }, 'Irrigation operational status')

@irrigation_bp.route('/decision', methods=['POST'])
def run_decision_check():
    farm_id = request.form.get('farm_id', 1, type=int) if not request.is_json else request.get_json().get('farm_id', 1)
    data = request.get_json() if request.is_json else request.form.to_dict()

    settings = SystemSetting.query.filter_by(farm_id=farm_id).first()
    threshold = float(data.get('moisture_threshold', settings.moisture_threshold if settings else 35.0))

    result = IrrigationDecisionEngine.evaluate(
        soil_moisture=float(data.get('soil_moisture', 55.0)),
        moisture_threshold=threshold,
        temperature=float(data.get('temperature', 27.0)),
        humidity=float(data.get('humidity', 68.0)),
        rain_detected=bool(data.get('rain_detected', False)),
        plant_health=int(data.get('plant_health', 90)),
        stress_level=str(data.get('stress_level', 'Low'))
    )
    return api_response(result, 'Evaluation calculated')

@irrigation_bp.route('/control', methods=['POST'])
def control_irrigation():
    data = request.get_json() or {}
    farm_id = data.get('farm_id', 1)
    action = data.get('action', '').upper()

    settings = SystemSetting.query.filter_by(farm_id=farm_id).first()
    if not settings:
        settings = SystemSetting(farm_id=farm_id, moisture_threshold=35.0, auto_irrigation=True, simulation_mode=True)
        db.session.add(settings)
        db.session.commit()

    latest_sensor = SensorReading.query.filter_by(farm_id=farm_id).order_by(SensorReading.id.desc()).first()
    sm = latest_sensor.soil_moisture if latest_sensor else 55.0
    temp = latest_sensor.temperature if latest_sensor else 27.0
    hum = latest_sensor.humidity if latest_sensor else 68.0
    rain = latest_sensor.rainfall_detected if latest_sensor else False

    sim = SensorSimulatorService.get_instance(current_app)

    if action in ['TURN_PUMP_ON', 'PUMP_ON', 'ON']:
        res = IrrigationDecisionEngine.process_and_act(
            farm_id=farm_id,
            soil_moisture=sm,
            temperature=temp,
            humidity=hum,
            rain_detected=rain,
            manual_override=True
        )
        sim.state["pump_status"] = "ON"
        msg = "Irrigation pump manually activated"

    elif action in ['TURN_PUMP_OFF', 'PUMP_OFF', 'OFF']:
        res = IrrigationDecisionEngine.process_and_act(
            farm_id=farm_id,
            soil_moisture=sm,
            temperature=temp,
            humidity=hum,
            rain_detected=rain,
            manual_override=False
        )
        sim.state["pump_status"] = "OFF"
        msg = "Irrigation pump manually shut down"

    elif action in ['AUTO_MODE', 'TOGGLE_AUTO']:
        new_val = not settings.auto_irrigation if 'value' not in data else bool(data['value'])
        settings.auto_irrigation = new_val
        db.session.commit()
        # Immediately re-evaluate with autonomous engine
        res = IrrigationDecisionEngine.process_and_act(
            farm_id=farm_id,
            soil_moisture=sm,
            temperature=temp,
            humidity=hum,
            rain_detected=rain
        )
        sim.state["pump_status"] = res["pump_status"]
        msg = f"Autonomous mode set to {'ENABLED' if new_val else 'DISABLED'}"

    elif action == 'SET_THRESHOLD':
        new_th = float(data.get('moisture_threshold', 35.0))
        settings.moisture_threshold = new_th
        db.session.commit()
        res = IrrigationDecisionEngine.process_and_act(
            farm_id=farm_id,
            soil_moisture=sm,
            temperature=temp,
            humidity=hum,
            rain_detected=rain
        )
        sim.state["pump_status"] = res["pump_status"]
        msg = f"Moisture threshold updated to {new_th}%"

    else:
        return api_error(f"Unknown action: {action}", 400)

    return api_response(res, msg)

@irrigation_bp.route('/history', methods=['GET'])
def get_irrigation_history():
    farm_id = request.args.get('farm_id', 1, type=int)
    limit = request.args.get('limit', 25, type=int)

    events = IrrigationEvent.query.filter_by(farm_id=farm_id).order_by(IrrigationEvent.timestamp.desc()).limit(limit).all()
    results = []
    for e in events:
        d = e.to_dict()
        # Calculate water used estimate (liters) = duration * 25 L/min
        d["water_used_liters"] = e.duration * 25 if e.pump_status in ["ON", "COMPLETED"] else 0
        results.append(d)

    return api_response(results, 'Irrigation events history')

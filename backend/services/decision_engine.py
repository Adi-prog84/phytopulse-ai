from datetime import datetime, timedelta
from extensions import db
from models.irrigation import IrrigationEvent
from models.alert import Alert
from models.setting import SystemSetting
from models.sensor import SensorReading
from models.plant_health import PlantHealth

class IrrigationDecisionEngine:
    """
    PhytoPulse AI Irrigation Decision Engine
    Core Concept: SENSE -> ANALYZE -> DECIDE -> ACT
    
    Inputs:
    - soil_moisture (%)
    - moisture_threshold (%)
    - temperature (°C)
    - humidity (%)
    - rain_detected (bool)
    - plant_health (score 0-100)
    - stress_level (Low, Moderate, High, Critical)
    """

    @staticmethod
    def evaluate(soil_moisture, moisture_threshold, temperature=27.0, humidity=65.0,
                 rain_detected=False, plant_health=90, stress_level="Low"):
        """
        Pure decision logic function evaluating agricultural sensor and canopy inputs.
        """
        soil_moisture = float(soil_moisture)
        moisture_threshold = float(moisture_threshold)
        temperature = float(temperature)
        humidity = float(humidity)
        rain_detected = bool(rain_detected)
        plant_health = int(plant_health) if plant_health is not None else 85
        stress_level = str(stress_level) if stress_level else "Low"

        # 1. Rain Priority Rule
        if rain_detected:
            pump_status = "OFF"
            decision = "PREVENT"
            priority = "NORMAL"
            reason = "Rain detected — irrigation prevented."
            recommended_duration = 0

        # 2. Moisture Below Threshold Rule
        elif soil_moisture < moisture_threshold:
            pump_status = "ON"
            decision = "IRRIGATE"
            
            # Plant stress & severity weighting
            is_critical = (
                soil_moisture < (moisture_threshold - 10) or
                stress_level in ["High", "Critical"] or
                plant_health < 60 or
                temperature >= 38.0
            )

            if is_critical:
                priority = "HIGH"
                if stress_level in ["High", "Critical"]:
                    reason = f"Soil moisture ({soil_moisture}%) below threshold ({moisture_threshold}%) with HIGH plant stress detected. Priority root-zone irrigation activated."
                elif temperature >= 38.0:
                    reason = f"Extreme heat ({temperature}°C) and low moisture ({soil_moisture}%). Accelerated irrigation needed to combat heat shock."
                else:
                    reason = f"Soil moisture critically low ({soil_moisture}% < {moisture_threshold}%)."
                recommended_duration = 20
            else:
                priority = "NORMAL"
                reason = f"Soil moisture ({soil_moisture}%) below configured threshold ({moisture_threshold}%)."
                recommended_duration = 15

        # 3. Moisture Sufficient Rule
        else:
            pump_status = "OFF"
            decision = "STANDBY"
            priority = "LOW"
            reason = f"Soil moisture sufficient ({soil_moisture}% >= {moisture_threshold}%)."
            recommended_duration = 0

        return {
            "pump_status": pump_status,
            "decision": decision,
            "priority": priority,
            "reason": reason,
            "recommended_duration": recommended_duration,
            "soil_moisture": soil_moisture,
            "moisture_threshold": moisture_threshold,
            "rain_detected": rain_detected,
            "plant_health": plant_health,
            "stress_level": stress_level,
            "temperature": temperature,
            "humidity": humidity
        }

    @staticmethod
    def process_and_act(farm_id, soil_moisture, temperature, humidity, rain_detected,
                        plant_health=None, stress_level=None, manual_override=None):
        """
        Executes decision engine on incoming sensor data, manages pump state,
        records irrigation events when state changes, and triggers alerts.
        """
        settings = SystemSetting.query.filter_by(farm_id=farm_id).first()
        moisture_threshold = settings.moisture_threshold if settings else 35.0
        auto_irrigation = settings.auto_irrigation if settings else True

        # Fetch latest plant health if not supplied
        if plant_health is None or stress_level is None:
            latest_ph = PlantHealth.query.filter_by(farm_id=farm_id).order_by(PlantHealth.timestamp.desc()).first()
            if latest_ph:
                plant_health = plant_health or latest_ph.health_score
                stress_level = stress_level or latest_ph.stress_level
            else:
                plant_health = plant_health or 90
                stress_level = stress_level or "Low"

        # Check latest irrigation event to know current pump status
        last_event = IrrigationEvent.query.filter_by(farm_id=farm_id).order_by(IrrigationEvent.timestamp.desc()).first()
        current_pump = last_event.pump_status if last_event else "OFF"

        if manual_override is not None:
            # Manual action requested
            pump_status = "ON" if manual_override else "OFF"
            decision = "MANUAL_START" if manual_override else "MANUAL_STOP"
            priority = "NORMAL"
            reason = "Manual override by farm operator." if manual_override else "Manual shutdown by farm operator."
            recommended_duration = 15 if manual_override else 0
        elif not auto_irrigation:
            # Auto mode disabled
            pump_status = current_pump
            decision = "STANDBY"
            priority = "LOW"
            reason = "Autonomous irrigation disabled by operator settings."
            recommended_duration = 0
        else:
            # Run autonomous evaluation
            eval_res = IrrigationDecisionEngine.evaluate(
                soil_moisture=soil_moisture,
                moisture_threshold=moisture_threshold,
                temperature=temperature,
                humidity=humidity,
                rain_detected=rain_detected,
                plant_health=plant_health,
                stress_level=stress_level
            )
            pump_status = eval_res["pump_status"]
            decision = eval_res["decision"]
            priority = eval_res["priority"]
            reason = eval_res["reason"]
            recommended_duration = eval_res["recommended_duration"]

        # Alert generation helper (debounces duplicate alerts in last 5 minutes)
        def maybe_create_alert(alert_type, severity, message):
            five_mins_ago = datetime.utcnow() - timedelta(minutes=5)
            existing = Alert.query.filter(
                Alert.farm_id == farm_id,
                Alert.type == alert_type,
                Alert.timestamp >= five_mins_ago
            ).first()
            if not existing:
                new_alert = Alert(
                    farm_id=farm_id,
                    type=alert_type,
                    severity=severity,
                    message=message,
                    is_read=False,
                    timestamp=datetime.utcnow()
                )
                db.session.add(new_alert)

        # Alert scenarios
        if rain_detected:
            maybe_create_alert("RAIN_DETECTED", "INFO", "Rain detected. Irrigation has been prevented to conserve water.")

        if soil_moisture < moisture_threshold:
            sev = "CRITICAL" if priority == "HIGH" else "WARNING"
            maybe_create_alert("LOW_SOIL_MOISTURE", sev, f"Soil moisture has fallen below threshold ({soil_moisture}% < {moisture_threshold}%).")

        if temperature >= 38.0:
            maybe_create_alert("HIGH_TEMPERATURE", "WARNING", f"Extreme temperature detected ({temperature}°C). Crop heat stress risk elevated.")

        if plant_health is not None and plant_health < 65:
            maybe_create_alert("PLANT_STRESS", "WARNING", f"Canopy AI detected plant stress (Health score: {plant_health}%). Visual inspection recommended.")

        # Log irrigation event if pump state changes or if pump is turned ON
        state_changed = (pump_status != current_pump)
        if state_changed or pump_status == "ON":
            event = IrrigationEvent(
                farm_id=farm_id,
                soil_moisture=soil_moisture,
                rainfall_detected=rain_detected,
                plant_health=plant_health,
                decision=decision,
                pump_status=pump_status,
                duration=recommended_duration,
                reason=reason,
                timestamp=datetime.utcnow()
            )
            db.session.add(event)
            
            if state_changed and pump_status == "ON":
                maybe_create_alert("PUMP_ACTIVATED", "INFO", f"Irrigation pump activated ({reason}).")
            elif state_changed and pump_status == "OFF":
                maybe_create_alert("PUMP_DEACTIVATED", "INFO", "Irrigation pump turned off.")

        db.session.commit()

        return {
            "farm_id": farm_id,
            "pump_status": pump_status,
            "auto_irrigation": auto_irrigation,
            "decision": decision,
            "priority": priority,
            "reason": reason,
            "recommended_duration": recommended_duration,
            "soil_moisture": soil_moisture,
            "moisture_threshold": moisture_threshold,
            "rainfall_detected": rain_detected,
            "plant_health": plant_health,
            "stress_level": stress_level,
            "temperature": temperature,
            "humidity": humidity
        }

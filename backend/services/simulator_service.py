import time
import threading
import random
from datetime import datetime
from extensions import db
from models.sensor import SensorReading
from models.setting import SystemSetting
from models.device import Device
from models.plant_health import PlantHealth
from services.decision_engine import IrrigationDecisionEngine

class SensorSimulatorService:
    """
    PhytoPulse AI Sensor & Hardware Simulator Service
    Generates realistic, gradually drifting telemetry and feeds into the same
    backend ingestion pipeline that physical ESP32 nodes will connect to.
    """

    _instance = None
    _lock = threading.Lock()

    def __init__(self, app=None):
        self.app = app
        self.is_running = True
        self.interval = 4  # seconds
        self.farm_id = 1
        self._thread = None
        self._stop_event = threading.Event()

        # In-memory current state
        self.state = {
            "soil_moisture": 55.0,
            "temperature": 27.0,
            "humidity": 68.0,
            "rain_detected": False,
            "plant_health": 92,
            "stress_level": "Low",
            "pump_status": "OFF",
            "scenario": "healthy",
            "last_tick": None
        }

    @classmethod
    def get_instance(cls, app=None):
        with cls._lock:
            if cls._instance is None:
                cls._instance = SensorSimulatorService(app)
            elif app and cls._instance.app is None:
                cls._instance.app = app
            return cls._instance

    def start(self):
        """Starts background simulation loop"""
        with self._lock:
            self.is_running = True
            if self._thread is None or not self._thread.is_alive():
                self._stop_event.clear()
                self._thread = threading.Thread(target=self._run_loop, daemon=True)
                self._thread.start()
        return self.get_status()

    def pause(self):
        """Pauses background simulation loop"""
        with self._lock:
            self.is_running = False
        return self.get_status()

    def reset(self):
        """Resets to baseline Healthy Field scenario"""
        return self.apply_scenario("healthy")

    def get_status(self):
        return {
            "is_running": self.is_running,
            "interval_seconds": self.interval,
            "farm_id": self.farm_id,
            "current_state": self.state
        }

    def apply_scenario(self, scenario_name):
        """
        Applies canonical SIH demonstration scenarios:
        - healthy
        - dry_soil
        - rain_detected
        - plant_stress
        - extreme_heat
        """
        name = scenario_name.lower().replace(" ", "_")

        if name in ["healthy", "healthy_field"]:
            self.state.update({
                "soil_moisture": 55.0,
                "temperature": 27.0,
                "humidity": 68.0,
                "rain_detected": False,
                "plant_health": 92,
                "stress_level": "Low",
                "scenario": "healthy"
            })
        elif name in ["dry_soil", "dry"]:
            self.state.update({
                "soil_moisture": 15.0,
                "temperature": 31.0,
                "humidity": 52.0,
                "rain_detected": False,
                "plant_health": 75,
                "stress_level": "Moderate",
                "scenario": "dry_soil"
            })
        elif name in ["rain_detected", "rain"]:
            self.state.update({
                "soil_moisture": 35.0,
                "temperature": 25.0,
                "humidity": 85.0,
                "rain_detected": True,
                "plant_health": 88,
                "stress_level": "Low",
                "scenario": "rain_detected"
            })
        elif name in ["plant_stress", "stress"]:
            self.state.update({
                "soil_moisture": 25.0,
                "temperature": 33.0,
                "humidity": 45.0,
                "rain_detected": False,
                "plant_health": 52,
                "stress_level": "High",
                "scenario": "plant_stress"
            })
        elif name in ["extreme_heat", "heat"]:
            self.state.update({
                "soil_moisture": 28.0,
                "temperature": 39.0,
                "humidity": 35.0,
                "rain_detected": False,
                "plant_health": 68,
                "stress_level": "Moderate",
                "scenario": "extreme_heat"
            })
        else:
            raise ValueError(f"Unknown scenario: {scenario_name}")

        # Immediate synchronous commit and decision cycle
        from flask import has_app_context
        if has_app_context():
            self._record_telemetry_and_evaluate()
        elif self.app:
            with self.app.app_context():
                self._record_telemetry_and_evaluate()

        return self.get_status()

    def apply_custom(self, custom_values):
        """Allows direct manual slider overrides from UI"""
        if "soil_moisture" in custom_values:
            self.state["soil_moisture"] = round(float(custom_values["soil_moisture"]), 1)
        if "temperature" in custom_values:
            self.state["temperature"] = round(float(custom_values["temperature"]), 1)
        if "humidity" in custom_values:
            self.state["humidity"] = round(float(custom_values["humidity"]), 1)
        if "rain_detected" in custom_values:
            self.state["rain_detected"] = bool(custom_values["rain_detected"])
        if "plant_health" in custom_values:
            self.state["plant_health"] = int(custom_values["plant_health"])
            if self.state["plant_health"] >= 80:
                self.state["stress_level"] = "Low"
            elif self.state["plant_health"] >= 60:
                self.state["stress_level"] = "Moderate"
            else:
                self.state["stress_level"] = "High"

        self.state["scenario"] = "custom"

        from flask import has_app_context
        if has_app_context():
            self._record_telemetry_and_evaluate()
        elif self.app:
            with self.app.app_context():
                self._record_telemetry_and_evaluate()

        return self.get_status()

    def _record_telemetry_and_evaluate(self):
        """
        Ingests simulated telemetry into MySQL database and invokes
        Decision Engine. (Identical to physical ESP32 pipeline).
        """
        try:
            # 1. Insert sensor reading
            reading = SensorReading(
                farm_id=self.farm_id,
                soil_moisture=self.state["soil_moisture"],
                temperature=self.state["temperature"],
                humidity=self.state["humidity"],
                rainfall_detected=self.state["rain_detected"],
                timestamp=datetime.now()
            )
            db.session.add(reading)
            db.session.commit()

            # 2. Invoke Decision Engine
            decision_res = IrrigationDecisionEngine.process_and_act(
                farm_id=self.farm_id,
                soil_moisture=self.state["soil_moisture"],
                temperature=self.state["temperature"],
                humidity=self.state["humidity"],
                rain_detected=self.state["rain_detected"],
                plant_health=self.state["plant_health"],
                stress_level=self.state["stress_level"]
            )

            # 3. Synchronize simulated pump state with decision engine
            self.state["pump_status"] = decision_res["pump_status"]
            self.state["last_tick"] = datetime.now().isoformat()

            # 4. Update virtual devices heartbeat
            Device.query.filter_by(farm_id=self.farm_id).update({
                "last_seen": datetime.now()
            })
            db.session.commit()

        except Exception as e:
            db.session.rollback()
            print(f"[Simulator Error] {e}")

    def _run_loop(self):
        """Continuous background drift loop"""
        while not self._stop_event.is_set():
            if self.is_running and self.app:
                with self.app.app_context():
                    self._step_simulation()
            time.sleep(self.interval)

    def _step_simulation(self):
        """Gradual, realistic dynamic shifts"""
        moisture = self.state["soil_moisture"]
        temp = self.state["temperature"]
        hum = self.state["humidity"]
        rain = self.state["rain_detected"]
        pump = self.state["pump_status"]

        # If pump is active, moisture climbs realistically
        if pump == "ON":
            moisture += random.uniform(1.2, 2.0)
            if moisture > 65.0:
                moisture = 65.0
        # If rain is detected, moisture also rises
        elif rain:
            moisture += random.uniform(0.6, 1.2)
            if moisture > 75.0:
                moisture = 75.0
        else:
            # Gradual natural evaporation
            moisture -= random.uniform(0.08, 0.22)
            if moisture < 12.0:
                moisture = 12.0

        # Gentle climate fluctuations
        temp += random.uniform(-0.15, 0.15)
        temp = max(18.0, min(40.0, temp))

        hum += random.uniform(-0.3, 0.3)
        hum = max(35.0, min(90.0, hum))

        self.state["soil_moisture"] = round(moisture, 1)
        self.state["temperature"] = round(temp, 1)
        self.state["humidity"] = round(hum, 1)

        self._record_telemetry_and_evaluate()

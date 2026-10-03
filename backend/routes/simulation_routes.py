from flask import Blueprint, request, current_app
from services.simulator_service import SensorSimulatorService
from utils.helpers import api_response, api_error

simulation_bp = Blueprint('simulation', __name__, url_prefix='/api/simulation')

@simulation_bp.route('/status', methods=['GET'])
def get_simulation_status():
    sim = SensorSimulatorService.get_instance(current_app)
    return api_response(sim.get_status(), 'Simulation status')

@simulation_bp.route('/start', methods=['POST'])
def start_simulation():
    sim = SensorSimulatorService.get_instance(current_app)
    status = sim.start()
    return api_response(status, 'Simulation started')

@simulation_bp.route('/stop', methods=['POST'])
def stop_simulation():
    sim = SensorSimulatorService.get_instance(current_app)
    status = sim.pause()
    return api_response(status, 'Simulation paused')

@simulation_bp.route('/reset', methods=['POST'])
def reset_simulation():
    sim = SensorSimulatorService.get_instance(current_app)
    status = sim.reset()
    return api_response(status, 'Simulation reset to Healthy Field baseline')

@simulation_bp.route('/scenario', methods=['POST'])
def apply_scenario():
    data = request.get_json() or {}
    scenario_name = data.get('scenario')
    if not scenario_name:
        return api_error('scenario name is required (healthy, dry_soil, rain_detected, plant_stress, extreme_heat)', 400)

    sim = SensorSimulatorService.get_instance(current_app)
    try:
        status = sim.apply_scenario(scenario_name)
        return api_response(status, f"Scenario '{scenario_name}' applied successfully")
    except ValueError as e:
        return api_error(str(e), 400)

@simulation_bp.route('/custom', methods=['POST'])
def apply_custom_telemetry():
    data = request.get_json() or {}
    sim = SensorSimulatorService.get_instance(current_app)
    status = sim.apply_custom(data)
    return api_response(status, 'Custom simulation parameters applied')

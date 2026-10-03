from flask import Blueprint, request
from extensions import db
from models.setting import SystemSetting
from utils.helpers import api_response, api_error

setting_bp = Blueprint('settings', __name__, url_prefix='/api/settings')

@setting_bp.route('', methods=['GET'])
def get_settings():
    farm_id = request.args.get('farm_id', 1, type=int)
    settings = SystemSetting.query.filter_by(farm_id=farm_id).first()
    if not settings:
        settings = SystemSetting(farm_id=farm_id, moisture_threshold=35.0, auto_irrigation=True, simulation_mode=True)
        db.session.add(settings)
        db.session.commit()
    return api_response(settings.to_dict(), 'Settings retrieved')

@setting_bp.route('', methods=['PUT'])
def update_settings():
    data = request.get_json() or {}
    farm_id = data.get('farm_id', 1)
    settings = SystemSetting.query.filter_by(farm_id=farm_id).first()
    if not settings:
        settings = SystemSetting(farm_id=farm_id)
        db.session.add(settings)

    if 'moisture_threshold' in data:
        settings.moisture_threshold = float(data['moisture_threshold'])
    if 'auto_irrigation' in data:
        settings.auto_irrigation = bool(data['auto_irrigation'])
    if 'simulation_mode' in data:
        settings.simulation_mode = bool(data['simulation_mode'])

    db.session.commit()
    return api_response(settings.to_dict(), 'Settings updated successfully')

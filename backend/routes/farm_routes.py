from flask import Blueprint, request
from extensions import db
from models.farm import Farm
from models.setting import SystemSetting
from utils.helpers import api_response, api_error

farm_bp = Blueprint('farms', __name__, url_prefix='/api/farms')

@farm_bp.route('', methods=['GET'])
def get_farms():
    farms = Farm.query.all()
    result = []
    for f in farms:
        item = f.to_dict()
        item['settings'] = f.settings.to_dict() if f.settings else None
        # Add farm zone details
        item['zones'] = [
            {
                "id": "zone-a",
                "name": "Zone A (North Block)",
                "crop": "Tomato (Solanum lycopersicum)",
                "soil_moisture": 55.0,
                "plant_health": 92,
                "pump_status": "OFF",
                "area": "1.0 acre",
                "irrigation_type": "Drip Irrigation"
            },
            {
                "id": "zone-b",
                "name": "Zone B (Greenhouse Polyhouse)",
                "crop": "Bell Pepper (Capsicum annuum)",
                "soil_moisture": 48.0,
                "plant_health": 95,
                "pump_status": "OFF",
                "area": "0.75 acre",
                "irrigation_type": "Micro-Sprinkler"
            },
            {
                "id": "zone-c",
                "name": "Zone C (South Orchard)",
                "crop": "Citrus / Lemon",
                "soil_moisture": 52.0,
                "plant_health": 89,
                "pump_status": "OFF",
                "area": "0.75 acre",
                "irrigation_type": "Basin Irrigation"
            }
        ]
        result.append(item)
    return api_response(result, 'Farms fetched successfully')

@farm_bp.route('/<int:farm_id>', methods=['GET'])
def get_farm(farm_id):
    farm = Farm.query.get(farm_id)
    if not farm:
        return api_error('Farm not found', 404)
    data = farm.to_dict()
    data['settings'] = farm.settings.to_dict() if farm.settings else None
    return api_response(data, 'Farm details')

@farm_bp.route('/<int:farm_id>', methods=['PUT'])
def update_farm(farm_id):
    farm = Farm.query.get(farm_id)
    if not farm:
        return api_error('Farm not found', 404)
    data = request.get_json() or {}
    farm.farm_name = data.get('farm_name', farm.farm_name)
    farm.location = data.get('location', farm.location)
    farm.area = data.get('area', farm.area)
    farm.crop_type = data.get('crop_type', farm.crop_type)
    db.session.commit()
    return api_response(farm.to_dict(), 'Farm updated successfully')

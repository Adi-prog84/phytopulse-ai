import os
from flask import Blueprint, request, current_app
from werkzeug.utils import secure_filename
from models.plant_health import PlantHealth
from services.plant_health_service import PlantHealthAIService
from services.simulator_service import SensorSimulatorService
from utils.helpers import api_response, api_error, allowed_file

plant_health_bp = Blueprint('plant_health', __name__, url_prefix='/api/plant-health')

@plant_health_bp.route('/analyze', methods=['POST'])
def analyze_plant_health():
    farm_id = request.form.get('farm_id', 1, type=int)
    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)

    file_path = None
    orig_name = ""

    # Option A: Uploaded file
    if 'image' in request.files and request.files['image'].filename:
        file = request.files['image']
        if not allowed_file(file.filename):
            return api_error('Invalid image type. Please upload PNG, JPG, JPEG, WEBP or BMP.', 400)
        
        orig_name = secure_filename(file.filename)
        timestamp_prefix = secure_filename(str(int(os.times().elapsed * 1000)))
        saved_name = f"{timestamp_prefix}_{orig_name}"
        file_path = os.path.join(upload_folder, saved_name)
        file.save(file_path)

    # Option B: Preset sample image selected
    elif request.is_json and request.get_json().get('sample'):
        sample_name = secure_filename(request.get_json().get('sample'))
        orig_name = sample_name
        file_path = os.path.join(upload_folder, sample_name)
        if not os.path.exists(file_path):
            # Ensure samples are created
            PlantHealthAIService.ensure_sample_images(upload_folder)

    # Option C: Sample passed via form data
    elif request.form.get('sample'):
        sample_name = secure_filename(request.form.get('sample'))
        orig_name = sample_name
        file_path = os.path.join(upload_folder, sample_name)
        if not os.path.exists(file_path):
            PlantHealthAIService.ensure_sample_images(upload_folder)

    if not file_path or not os.path.exists(file_path):
        return api_error('No valid leaf image provided for analysis', 400)

    # Run AI Vision service
    result = PlantHealthAIService.analyze_image(file_path, farm_id=farm_id, filename=orig_name)

    # Update in-memory simulator state with new plant health
    sim = SensorSimulatorService.get_instance(current_app)
    sim.state["plant_health"] = result["metrics"]["health_score"]
    sim.state["stress_level"] = result["metrics"]["stress_level"]

    return api_response(result, 'Canopy health evaluated successfully')

@plant_health_bp.route('/history', methods=['GET'])
def get_plant_health_history():
    farm_id = request.args.get('farm_id', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    records = PlantHealth.query.filter_by(farm_id=farm_id).order_by(PlantHealth.timestamp.desc()).limit(limit).all()
    return api_response([r.to_dict() for r in records], 'Plant health records')

@plant_health_bp.route('/samples', methods=['GET'])
def get_samples():
    upload_folder = current_app.config['UPLOAD_FOLDER']
    PlantHealthAIService.ensure_sample_images(upload_folder)

    samples = [
        {
            "id": "healthy",
            "name": "sample_healthy.jpg",
            "title": "Healthy Leaf (Optimal Chlorophyll)",
            "description": "Standard Solanum foliage exhibiting vibrant turgor and chlorophyll density.",
            "expected_outcome": "Healthy (~92% Score, Low Stress)",
            "image_url": "/api/uploads/sample_healthy.jpg"
        },
        {
            "id": "dry_stress",
            "name": "sample_dry_stress.jpg",
            "title": "Water Deficit / Heat Scorch",
            "description": "Brown marginal crisping symptomatic of prolonged moisture stress.",
            "expected_outcome": "Stress Detected (~65% Score, Moderate Stress)",
            "image_url": "/api/uploads/sample_dry_stress.jpg"
        },
        {
            "id": "blight",
            "name": "sample_blight.jpg",
            "title": "Early Blight (Alternaria Lesions)",
            "description": "Concentric rings and necrotic lesions indicating fungal pathology.",
            "expected_outcome": "Critical Stress (~40% Score, High Stress)",
            "image_url": "/api/uploads/sample_blight.jpg"
        },
        {
            "id": "chlorosis",
            "name": "sample_chlorosis.jpg",
            "title": "Chlorosis / Nutrient Deficiency",
            "description": "Interveinal yellowing indicative of nitrogen or magnesium leaching.",
            "expected_outcome": "Mild Stress (~72% Score, Nitrogen Alert)",
            "image_url": "/api/uploads/sample_chlorosis.jpg"
        }
    ]
    return api_response(samples, 'Sample test images')

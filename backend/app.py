import os
from flask import Flask, send_from_directory, jsonify
from config import Config
from extensions import db, jwt, cors
from routes import register_blueprints
from services.plant_health_service import PlantHealthAIService
from services.simulator_service import SensorSimulatorService

def create_app(config_class=Config, start_simulator=True):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True
    )

    # Ensure uploads directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register blueprints
    register_blueprints(app)

    # Static file serving for uploads (leaf scan photos and samples)
    @app.route('/api/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # System Health Check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "ONLINE",
            "project": "PhytoPulse AI",
            "problem_statement": "SIH26180",
            "theme": "Smart Agriculture & Climate Resilience",
            "mode": "DEMO_SIMULATION_MODE",
            "database": "MySQL Connected"
        }), 200

    # Serve built React frontend directly from Flask if available
    dist_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path.startswith('api/'):
            return jsonify({"success": False, "message": "API endpoint not found"}), 404
        if os.path.exists(dist_folder) and path and os.path.exists(os.path.join(dist_folder, path)):
            return send_from_directory(dist_folder, path)
        elif os.path.exists(dist_folder) and os.path.exists(os.path.join(dist_folder, 'index.html')):
            return send_from_directory(dist_folder, 'index.html')
        return jsonify({
            "message": "PhytoPulse AI Backend Active. Access frontend via Vite at http://localhost:5173 or run npm run build."
        })

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            "success": False,
            "message": "Resource not found",
            "error": str(e)
        }), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({
            "success": False,
            "message": "Internal server error occurred",
            "error": str(e)
        }), 500

    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({
            "success": False,
            "message": "Missing or invalid Authorization header"
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "success": False,
            "message": "The token has expired. Please log in again."
        }), 401

    # App Context initialization
    with app.app_context():
        # Ensure tables exist
        db.create_all()
        # Seed visual AI sample images
        PlantHealthAIService.ensure_sample_images(app.config['UPLOAD_FOLDER'])
        if start_simulator:
            simulator = SensorSimulatorService.get_instance(app)
            simulator.start()

    return app

app = create_app(start_simulator=False)

if __name__ == '__main__':
    simulator = SensorSimulatorService.get_instance(app)
    simulator.start()
    port = int(os.environ.get('PORT', 5000))
    print(f"[*] PhytoPulse AI Backend Server listening on http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)

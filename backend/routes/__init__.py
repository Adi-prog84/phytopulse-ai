from routes.auth_routes import auth_bp
from routes.farm_routes import farm_bp
from routes.sensor_routes import sensor_bp
from routes.plant_health_routes import plant_health_bp
from routes.irrigation_routes import irrigation_bp
from routes.alert_routes import alert_bp
from routes.analytics_routes import analytics_bp
from routes.device_routes import device_bp
from routes.simulation_routes import simulation_bp
from routes.setting_routes import setting_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(farm_bp)
    app.register_blueprint(sensor_bp)
    app.register_blueprint(plant_health_bp)
    app.register_blueprint(irrigation_bp)
    app.register_blueprint(alert_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(device_bp)
    app.register_blueprint(simulation_bp)
    app.register_blueprint(setting_bp)

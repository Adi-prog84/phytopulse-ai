from extensions import db

class SystemSetting(db.Model):
    __tablename__ = 'system_settings'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    farm_id = db.Column(db.Integer, db.ForeignKey('farms.id', ondelete='CASCADE'), nullable=False, unique=True)
    moisture_threshold = db.Column(db.Float, nullable=False, default=35.0)
    auto_irrigation = db.Column(db.Boolean, nullable=False, default=True)
    simulation_mode = db.Column(db.Boolean, nullable=False, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'farm_id': self.farm_id,
            'moisture_threshold': round(float(self.moisture_threshold), 1),
            'auto_irrigation': bool(self.auto_irrigation),
            'simulation_mode': bool(self.simulation_mode)
        }

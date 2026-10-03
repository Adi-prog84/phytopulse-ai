from datetime import datetime
from extensions import db

class SensorReading(db.Model):
    __tablename__ = 'sensor_readings'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    farm_id = db.Column(db.Integer, db.ForeignKey('farms.id', ondelete='CASCADE'), nullable=False, index=True)
    soil_moisture = db.Column(db.Float, nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)
    rainfall_detected = db.Column(db.Boolean, nullable=False, default=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now, index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'farm_id': self.farm_id,
            'soil_moisture': round(float(self.soil_moisture), 1),
            'temperature': round(float(self.temperature), 1),
            'humidity': round(float(self.humidity), 1),
            'rainfall_detected': bool(self.rainfall_detected),
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

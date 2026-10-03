from datetime import datetime
from extensions import db

class IrrigationEvent(db.Model):
    __tablename__ = 'irrigation_events'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    farm_id = db.Column(db.Integer, db.ForeignKey('farms.id', ondelete='CASCADE'), nullable=False, index=True)
    soil_moisture = db.Column(db.Float, nullable=False)
    rainfall_detected = db.Column(db.Boolean, nullable=False, default=False)
    plant_health = db.Column(db.Integer, nullable=True)
    decision = db.Column(db.String(50), nullable=False)  # IRRIGATE, PREVENT, STANDBY, MANUAL_START, MANUAL_STOP
    pump_status = db.Column(db.String(20), nullable=False)  # ON, OFF, COMPLETED
    duration = db.Column(db.Integer, nullable=False, default=0)  # minutes
    reason = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'farm_id': self.farm_id,
            'soil_moisture': round(float(self.soil_moisture), 1),
            'rainfall_detected': bool(self.rainfall_detected),
            'plant_health': self.plant_health,
            'decision': self.decision,
            'pump_status': self.pump_status,
            'duration': self.duration,
            'reason': self.reason,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

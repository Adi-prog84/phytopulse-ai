from datetime import datetime
from extensions import db

class PlantHealth(db.Model):
    __tablename__ = 'plant_health'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    farm_id = db.Column(db.Integer, db.ForeignKey('farms.id', ondelete='CASCADE'), nullable=False, index=True)
    image_path = db.Column(db.String(255), nullable=True)
    health_score = db.Column(db.Integer, nullable=False)
    health_status = db.Column(db.String(50), nullable=False)
    stress_level = db.Column(db.String(50), nullable=False)
    detected_issue = db.Column(db.String(255), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    recommendation = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'farm_id': self.farm_id,
            'image_path': self.image_path,
            'health_score': self.health_score,
            'health_status': self.health_status,
            'stress_level': self.stress_level,
            'detected_issue': self.detected_issue,
            'confidence': round(float(self.confidence), 1),
            'recommendation': self.recommendation,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

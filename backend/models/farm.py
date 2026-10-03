from datetime import datetime
from extensions import db

class Farm(db.Model):
    __tablename__ = 'farms'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    farm_name = db.Column(db.String(150), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    area = db.Column(db.String(50), nullable=False)
    crop_type = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    sensor_readings = db.relationship('SensorReading', backref='farm', lazy=True, cascade='all, delete-orphan')
    plant_health_records = db.relationship('PlantHealth', backref='farm', lazy=True, cascade='all, delete-orphan')
    irrigation_events = db.relationship('IrrigationEvent', backref='farm', lazy=True, cascade='all, delete-orphan')
    alerts = db.relationship('Alert', backref='farm', lazy=True, cascade='all, delete-orphan')
    devices = db.relationship('Device', backref='farm', lazy=True, cascade='all, delete-orphan')
    settings = db.relationship('SystemSetting', backref='farm', uselist=False, lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'farm_name': self.farm_name,
            'location': self.location,
            'area': self.area,
            'crop_type': self.crop_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

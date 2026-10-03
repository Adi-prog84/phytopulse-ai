from datetime import datetime
from extensions import db

class Device(db.Model):
    __tablename__ = 'devices'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    farm_id = db.Column(db.Integer, db.ForeignKey('farms.id', ondelete='CASCADE'), nullable=False, index=True)
    device_name = db.Column(db.String(100), nullable=False)
    device_type = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='ONLINE')  # ONLINE, OFFLINE
    last_seen = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    signal_strength = db.Column(db.Integer, nullable=False, default=-65)  # dBm

    def to_dict(self):
        return {
            'id': self.id,
            'farm_id': self.farm_id,
            'device_name': self.device_name,
            'device_type': self.device_type,
            'status': self.status,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None,
            'signal_strength': self.signal_strength
        }

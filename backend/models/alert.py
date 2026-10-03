from datetime import datetime
from extensions import db

class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    farm_id = db.Column(db.Integer, db.ForeignKey('farms.id', ondelete='CASCADE'), nullable=False, index=True)
    type = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.String(20), nullable=False, default='INFO')  # INFO, WARNING, CRITICAL
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, nullable=False, default=False, index=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'farm_id': self.farm_id,
            'type': self.type,
            'severity': self.severity,
            'message': self.message,
            'is_read': bool(self.is_read),
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

from flask import Blueprint, request
from extensions import db
from models.alert import Alert
from utils.helpers import api_response, api_error

alert_bp = Blueprint('alerts', __name__, url_prefix='/api/alerts')

@alert_bp.route('', methods=['GET'])
def get_alerts():
    farm_id = request.args.get('farm_id', 1, type=int)
    severity = request.args.get('severity')
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    limit = request.args.get('limit', 50, type=int)

    query = Alert.query.filter_by(farm_id=farm_id)

    if severity:
        query = query.filter_by(severity=severity.upper())
    if unread_only:
        query = query.filter_by(is_read=False)

    alerts = query.order_by(Alert.timestamp.desc()).limit(limit).all()
    unread_count = Alert.query.filter_by(farm_id=farm_id, is_read=False).count()

    return api_response({
        'alerts': [a.to_dict() for a in alerts],
        'unread_count': unread_count,
        'total_count': query.count()
    }, 'Alerts retrieved')

@alert_bp.route('/<int:alert_id>/read', methods=['PUT'])
def mark_read(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return api_error('Alert not found', 404)
    alert.is_read = True
    db.session.commit()
    return api_response(alert.to_dict(), 'Alert marked as read')

@alert_bp.route('/read-all', methods=['PUT'])
def mark_all_read():
    farm_id = request.args.get('farm_id', 1, type=int)
    Alert.query.filter_by(farm_id=farm_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return api_response(None, 'All alerts marked as read')

@alert_bp.route('/<int:alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return api_error('Alert not found', 404)
    db.session.delete(alert)
    db.session.commit()
    return api_response(None, 'Alert deleted successfully')

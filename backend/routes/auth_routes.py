from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models.user import User
from models.farm import Farm
from models.setting import SystemSetting
from utils.helpers import api_response, api_error

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'farmer')

    if not name or not email or not password:
        return api_error('Name, email, and password are required', 400)

    if User.query.filter_by(email=email).first():
        return api_error('User with this email already exists', 409)

    user = User(name=name, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # Automatically create default farm and settings for the user
    farm = Farm(
        user_id=user.id,
        farm_name=f"{name}'s Farm",
        location="Mysuru, Karnataka",
        area="2.0 acres",
        crop_type="Tomato"
    )
    db.session.add(farm)
    db.session.commit()

    setting = SystemSetting(
        farm_id=farm.id,
        moisture_threshold=35.0,
        auto_irrigation=True,
        simulation_mode=True
    )
    db.session.add(setting)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return api_response({
        'user': user.to_dict(),
        'farm': farm.to_dict(),
        'access_token': access_token
    }, 'User registered successfully', 201)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return api_error('Email and password are required', 400)

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return api_error('Invalid email or password', 401)

    farm = Farm.query.filter_by(user_id=user.id).first()
    access_token = create_access_token(identity=str(user.id))

    return api_response({
        'user': user.to_dict(),
        'farm': farm.to_dict() if farm else None,
        'access_token': access_token
    }, 'Login successful')

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return api_error('User not found', 404)

    farm = Farm.query.filter_by(user_id=user.id).first()
    return api_response({
        'user': user.to_dict(),
        'farm': farm.to_dict() if farm else None
    }, 'Current user profile')

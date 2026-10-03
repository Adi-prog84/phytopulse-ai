import os
from datetime import timedelta
from urllib.parse import quote_plus
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'phytopulse_flask_secret_key_sih2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'phytopulse_jwt_secret_key_sih2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', 'Adisjce@2028')
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = os.environ.get('DB_PORT', '3306')
    DB_NAME = os.environ.get('DB_NAME', 'phytopulse_db')

    # Construct PyMySQL URI with URL-encoded password
    encoded_user = quote_plus(DB_USER)
    encoded_password = quote_plus(DB_PASSWORD)
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{encoded_user}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 280,
        'pool_pre_ping': True
    }

    UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'bmp'}

    DEFAULT_FARM_ID = int(os.environ.get('DEFAULT_FARM_ID', 1))
    SIMULATION_INTERVAL_SECONDS = int(os.environ.get('SIMULATION_INTERVAL_SECONDS', 4))

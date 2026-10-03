import os
from flask import jsonify
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'bmp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def api_response(data=None, message="Success", status_code=200, success=True):
    response = {
        "success": success,
        "message": message,
        "data": data
    }
    return jsonify(response), status_code

def api_error(message="An error occurred", status_code=400, errors=None):
    response = {
        "success": False,
        "message": message,
        "errors": errors or []
    }
    return jsonify(response), status_code

from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from ..models import User

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()  # 👈 Ensure JWT is present
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if user and user.role == 'admin':
            return fn(*args, **kwargs)
        return jsonify({"error": "Admin access required"}), 403
    return wrapper

def teacher_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()  # 👈 Ensure JWT is present
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if user and user.role == 'teacher':
            return fn(*args, **kwargs)
        return jsonify({"error": "Teacher access required"}), 403
    return wrapper

__all__ = ["teacher_required", "admin_required"]

from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models import User  # Make sure this import is correct

def teacher_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()  # Verifies that the request has a valid JWT
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        # Ensure the user has the teacher role
        if not user or user.role != "teacher":
            return jsonify({"message": "Teacher access required"}), 403

        return f(*args, **kwargs)
    return decorated_function

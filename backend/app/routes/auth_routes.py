from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

def teacher_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()  # Verifies that the request has a valid JWT
        current_user = get_jwt_identity()

        # Ensure the user has the teacher role
        if not current_user or current_user.get("role") != "teacher":
            return jsonify({"message": "Teacher access required"}), 403

        return f(*args, **kwargs)
    return decorated_function

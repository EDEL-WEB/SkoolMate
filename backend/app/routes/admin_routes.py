from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User  # Adjust import as needed

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/admin')

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def admin_dashboard():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.role != 'admin':
        return jsonify({"error": "Access forbidden: Admins only"}), 403

    return jsonify({"message": f"Welcome Admin {user.username}!"})

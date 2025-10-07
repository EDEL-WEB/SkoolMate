from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models import Department

department_bp = Blueprint('department_bp', __name__)

@department_bp.route('/departments', methods=['GET'])
@jwt_required()
def get_departments():
    departments = Department.query.all()
    return jsonify([dept.to_dict() for dept in departments])
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models import Attendance

attendance_bp = Blueprint('attendance_bp', __name__)

@attendance_bp.route('/attendance', methods=['GET'])
@jwt_required()
def get_attendance():
    attendance = Attendance.query.all()
    return jsonify([att.to_dict() for att in attendance])
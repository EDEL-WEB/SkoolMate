# attendance_routes.py
from flask import Blueprint, request, jsonify
from backend.app.models import db, Attendance, Student, Teacher

from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.utils.decorators import teacher_required
from backend.app.utils.decorators import admin_required



attendance_bp = Blueprint("attendance", __name__)

@attendance_bp.route('/attendance', methods=['POST'])
@jwt_required()
@teacher_required
def mark_attendance():
    data = request.get_json()
    teacher_id = get_jwt_identity()["id"]
    
    attendance = Attendance(
        student_id=data["student_id"],
        date=data["date"],
        status=data["status"],
        teacher_id=teacher_id
    )
    db.session.add(attendance)
    db.session.commit()
    return jsonify(attendance.to_dict()), 201


@attendance_bp.route('/attendance', methods=['GET'])
@jwt_required()
@teacher_required
def get_attendance_records():
    records = Attendance.query.all()
    return jsonify([r.to_dict() for r in records]), 200

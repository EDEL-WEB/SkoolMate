from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import Student, db
from app.auth import admin_required, teacher_required

student_bp = Blueprint('student_routes', __name__)

# Get all students
@student_bp.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    students = Student.query.all()
    return jsonify([s.to_dict() for s in students]), 200

# Add a new student
@student_bp.route('/students', methods=['POST'])
@jwt_required()
@admin_required
def add_student():
    data = request.get_json()
    student = Student(**data)
    db.session.add(student)
    db.session.commit()
    return jsonify(student.to_dict()), 201

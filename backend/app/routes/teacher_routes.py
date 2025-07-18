from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import Teacher, db
from app.auth import admin_required

teacher_bp = Blueprint('teacher_routes', __name__)

# Get all teachers
@teacher_bp.route('/teachers', methods=['GET'])
@jwt_required()
@admin_required
def get_teachers():
    teachers = Teacher.query.all()
    return jsonify([t.to_dict() for t in teachers]), 200

# Add a new teacher
@teacher_bp.route('/teachers', methods=['POST'])
@jwt_required()
@admin_required
def add_teacher():
    data = request.get_json()
    teacher = Teacher(**data)
    db.session.add(teacher)
    db.session.commit()
    return jsonify(teacher.to_dict()), 201

# Update a teacher
@teacher_bp.route('/teachers/<int:id>', methods=['PATCH'])
@jwt_required()
@admin_required
def update_teacher(id):
    teacher = Teacher.query.get_or_404(id)
    data = request.get_json()
    teacher.full_name = data.get('full_name', teacher.full_name)
    teacher.user_id = data.get('user_id', teacher.user_id)
    db.session.commit()
    return jsonify(teacher.to_dict()), 200

# Delete a teacher
@teacher_bp.route('/teachers/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_teacher(id):
    teacher = Teacher.query.get_or_404(id)
    db.session.delete(teacher)
    db.session.commit()
    return jsonify({"message": "Teacher deleted"}), 200

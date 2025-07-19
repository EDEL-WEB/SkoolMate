from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.app.models import Student, db, DormAssignment
from backend.app.utils.decorators import teacher_required
from backend.app.utils.decorators import admin_required

from backend.app.utils.cloudinary_uploads import upload_image_to_cloudinary

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

# Update a student
@student_bp.route('/students/<int:id>', methods=['PATCH'])
@jwt_required()
@admin_required
def update_student(id):
    student = Student.query.get_or_404(id)

    # Support both JSON and multipart/form-data
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        data = request.form
    else:
        data = request.get_json() or {}

    student.full_name = data.get('full_name', student.full_name)
    student.user_id = data.get('user_id', student.user_id)
    student.gender = data.get('gender', student.gender)
    student.date_of_birth = data.get('date_of_birth', student.date_of_birth)
    student.parent_contact = data.get('parent_contact', student.parent_contact)
    student.classroom_id = data.get('classroom_id', student.classroom_id)

    # Handle image upload if present
    if 'image' in request.files:
        file = request.files['image']
        image_url = upload_image_to_cloudinary(file)
        student.image_url = image_url

    db.session.commit()
    return jsonify(student.to_dict()), 200

# Delete a student
@student_bp.route('/students/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_student(id):
    student = Student.query.get_or_404(id)
    db.session.delete(student)
    db.session.commit()
    return jsonify({"message": "Student deleted"}), 200

# Get students by dorm
@student_bp.route('/students/dorm/<int:dorm_id>', methods=['GET'])
@jwt_required()
def get_students_by_dorm(dorm_id):
    dorm_assignments = DormAssignment.query.filter_by(dorm_id=dorm_id).all()
    students = [da.student.to_dict() for da in dorm_assignments if da.student]
    return jsonify(students), 200

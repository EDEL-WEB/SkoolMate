from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.app.models import Student, db, DormAssignment
from backend.app.utils.decorators import teacher_required, admin_required
from backend.app.utils.cloudinary_uploads import upload_image_to_cloudinary
from datetime import datetime

student_bp = Blueprint('student_routes', __name__)

# Helper: Parse date string into Python date object
def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None

# GET all students
@student_bp.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    students = Student.query.all()
    return jsonify([s.to_dict() for s in students]), 200

# POST a new student
@student_bp.route('/students', methods=['POST'])
@jwt_required()
@admin_required
def add_student():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON data"}), 400

    date_of_birth = parse_date(data.get('date_of_birth'))
    if not date_of_birth:
        return jsonify({"error": "Invalid or missing date_of_birth (expected format: YYYY-MM-DD)"}), 400

    try:
        student = Student(
            full_name=data.get('full_name'),
            user_id=data.get('user_id'),
            gender=data.get('gender'),
            date_of_birth=date_of_birth,
            parent_contact=data.get('parent_contact'),
            classroom_id=data.get('classroom_id'),
            image_url=data.get('image_url')
        )
        db.session.add(student)
        db.session.commit()
        return jsonify(student.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# PATCH update student
@student_bp.route('/students/<int:id>', methods=['PATCH'])
@jwt_required()
@admin_required
def update_student(id):
    student = Student.query.get_or_404(id)

    if request.content_type and request.content_type.startswith('multipart/form-data'):
        data = request.form
    else:
        data = request.get_json() or {}

    # Update fields
    if 'date_of_birth' in data:
        dob = parse_date(data.get('date_of_birth'))
        if not dob:
            return jsonify({"error": "Invalid date_of_birth format. Use YYYY-MM-DD"}), 400
        student.date_of_birth = dob

    student.full_name = data.get('full_name', student.full_name)
    student.user_id = data.get('user_id', student.user_id)
    student.gender = data.get('gender', student.gender)
    student.parent_contact = data.get('parent_contact', student.parent_contact)
    student.classroom_id = data.get('classroom_id', student.classroom_id)

    # Image upload
    if 'image' in request.files:
        file = request.files['image']
        image_url = upload_image_to_cloudinary(file)
        student.image_url = image_url

    try:
        db.session.commit()
        return jsonify(student.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# DELETE student
@student_bp.route('/students/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_student(id):
    student = Student.query.get_or_404(id)
    try:
        db.session.delete(student)
        db.session.commit()
        return jsonify({"message": "Student deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# GET students by dorm
@student_bp.route('/students/dorm/<int:dorm_id>', methods=['GET'])
@jwt_required()
def get_students_by_dorm(dorm_id):
    dorm_assignments = DormAssignment.query.filter_by(dorm_id=dorm_id).all()
    students = [da.student.to_dict() for da in dorm_assignments if da.student]
    return jsonify(students), 200

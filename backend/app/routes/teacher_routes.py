from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.app.models import Teacher, db

from backend.app.utils.decorators import admin_required

from backend.app.utils.cloudinary_uploads import upload_image_to_cloudinary

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

    # Support both JSON and multipart/form-data
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        data = request.form
    else:
        data = request.get_json() or {}

    teacher.full_name = data.get('full_name', teacher.full_name)
    teacher.user_id = data.get('user_id', teacher.user_id)

    # Handle image upload if present
    if 'image' in request.files:
        file = request.files['image']
        image_url = upload_image_to_cloudinary(file)
        teacher.image_url = image_url

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

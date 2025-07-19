from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.models import Enrollment, Student, Subject, db, User, Teacher
from backend.app.utils.decorators import teacher_required
from backend.app.utils.decorators import admin_required


enrollment_bp = Blueprint('enrollment_routes', __name__)

# Enroll a student in a subject
@enrollment_bp.route('/enrollments', methods=['POST'])
@jwt_required()
def enroll_student():
    data = request.get_json()
    student_id = data.get('student_id')
    subject_id = data.get('subject_id')
    if not student_id or not subject_id:
        return jsonify({"error": "student_id and subject_id are required"}), 400

    # Get current user and check if they are the teacher for this subject
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != "teacher":
        return jsonify({"error": "Only teachers can enroll students."}), 403

    teacher = Teacher.query.filter_by(user_id=user.id).first()
    subject = Subject.query.get(subject_id)
    if not subject or subject.teacher_id != teacher.id:
        return jsonify({"error": "You are not the teacher for this subject."}), 403

    # Prevent duplicate enrollment
    existing = Enrollment.query.filter_by(student_id=student_id, subject_id=subject_id).first()
    if existing:
        return jsonify({"error": "Student already enrolled in this subject"}), 400

    enrollment = Enrollment(student_id=student_id, subject_id=subject_id)
    db.session.add(enrollment)
    db.session.commit()
    return jsonify(enrollment.to_dict()), 201

# Get all enrollments for a student
@enrollment_bp.route('/enrollments/student/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_enrollments(student_id):
    enrollments = Enrollment.query.filter_by(student_id=student_id).all()
    return jsonify([e.to_dict() for e in enrollments]), 200

# Get all students enrolled in a subject
@enrollment_bp.route('/enrollments/subject/<int:subject_id>', methods=['GET'])
@jwt_required()
def get_subject_enrollments(subject_id):
    enrollments = Enrollment.query.filter_by(subject_id=subject_id).all()
    return jsonify([e.to_dict() for e in enrollments]), 200

# Remove a student's enrollment from a subject
@enrollment_bp.route('/enrollments', methods=['DELETE'])
@jwt_required()
def delete_enrollment():
    data = request.get_json()
    student_id = data.get('student_id')
    subject_id = data.get('subject_id')
    enrollment = Enrollment.query.filter_by(student_id=student_id, subject_id=subject_id).first()
    if not enrollment:
        return jsonify({"error": "Enrollment not found"}), 404
    db.session.delete(enrollment)
    db.session.commit()
    return jsonify({"message": "Enrollment deleted"}), 200
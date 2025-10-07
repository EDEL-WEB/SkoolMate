from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from ..models import Enrollment, db

enrollment_bp = Blueprint('enrollment_bp', __name__)

@enrollment_bp.route('/enrollments', methods=['GET'])
@jwt_required()
def get_enrollments():
    enrollments = Enrollment.query.all()
    return jsonify([enrollment.to_dict() for enrollment in enrollments])

@enrollment_bp.route('/enrollments', methods=['POST'])
@jwt_required()
def create_enrollment():
    data = request.get_json()
    
    # Check if already enrolled
    existing = Enrollment.query.filter_by(
        student_id=data['student_id'],
        subject_id=data['subject_id']
    ).first()
    
    if existing:
        return jsonify({"error": "Student already enrolled in this subject"}), 409
    
    try:
        enrollment = Enrollment(
            student_id=data['student_id'],
            subject_id=data['subject_id']
        )
        db.session.add(enrollment)
        db.session.commit()
        return jsonify(enrollment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create enrollment"}), 500

@enrollment_bp.route('/enrollments/<int:enrollment_id>', methods=['DELETE'])
@jwt_required()
def delete_enrollment(enrollment_id):
    enrollment = Enrollment.query.get_or_404(enrollment_id)
    
    try:
        db.session.delete(enrollment)
        db.session.commit()
        return jsonify({"message": "Enrollment removed successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to remove enrollment"}), 500
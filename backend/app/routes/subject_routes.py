from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from ..models import Subject, db

subject_bp = Blueprint('subject_bp', __name__)

@subject_bp.route('/subjects', methods=['GET'])
@jwt_required()
def get_subjects():
    subjects = Subject.query.all()
    return jsonify([subject.to_dict() for subject in subjects])

@subject_bp.route('/subjects', methods=['POST'])
@jwt_required()
def create_subject():
    data = request.get_json()
    try:
        subject = Subject(
            name=data['name'],
            teacher_id=data.get('teacher_id'),
            department_id=data.get('department_id')
        )
        db.session.add(subject)
        db.session.commit()
        return jsonify(subject.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create subject"}), 500
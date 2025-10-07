from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from ..models import Classroom, db

class_bp = Blueprint('class_bp', __name__, url_prefix='/classrooms')

@class_bp.route('/', methods=['GET'])
@jwt_required()
def get_classrooms():
    classrooms = Classroom.query.all()
    return jsonify([classroom.to_dict() for classroom in classrooms])

@class_bp.route('/', methods=['POST'])
@jwt_required()
def create_classroom():
    data = request.get_json()
    
    existing = Classroom.query.filter_by(name=data['name']).first()
    if existing:
        return jsonify({"error": "Classroom already exists"}), 409
    
    try:
        classroom = Classroom(name=data['name'])
        db.session.add(classroom)
        db.session.commit()
        return jsonify(classroom.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create classroom"}), 500
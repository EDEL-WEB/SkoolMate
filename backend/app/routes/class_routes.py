from flask import Blueprint, request, jsonify
from app.models import db, Class
from flask_jwt_extended import jwt_required
from app.auth import admin_required

class_bp = Blueprint('class_routes', __name__)

# Get all classes
@class_bp.route('/classes', methods=['GET'])
@jwt_required()
def get_classes():
    classes = Class.query.all()
    return jsonify([c.to_dict() for c in classes]), 200

# Get one class
@class_bp.route('/classes/<int:id>', methods=['GET'])
@jwt_required()
def get_class(id):
    class_ = Class.query.get_or_404(id)
    return jsonify(class_.to_dict()), 200

# Create class
@class_bp.route('/classes', methods=['POST'])
@jwt_required()
@admin_required
def create_class():
    data = request.get_json()
    new_class = Class(name=data['name'], teacher_id=data.get('teacher_id'))
    db.session.add(new_class)
    db.session.commit()
    return jsonify(new_class.to_dict()), 201

# Update class
@class_bp.route('/classes/<int:id>', methods=['PATCH'])
@jwt_required()
@admin_required
def update_class(id):
    class_ = Class.query.get_or_404(id)
    data = request.get_json()
    class_.name = data.get('name', class_.name)
    class_.teacher_id = data.get('teacher_id', class_.teacher_id)
    db.session.commit()
    return jsonify(class_.to_dict()), 200

# Delete class
@class_bp.route('/classes/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_class(id):
    class_ = Class.query.get_or_404(id)
    db.session.delete(class_)
    db.session.commit()
    return jsonify({"message": "Class deleted"}), 200

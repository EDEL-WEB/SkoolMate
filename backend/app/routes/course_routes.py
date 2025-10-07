from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models import Course

course_bp = Blueprint('course_bp', __name__)

@course_bp.route('/courses', methods=['GET'])
@jwt_required()
def get_courses():
    courses = Course.query.all()
    return jsonify([course.to_dict() for course in courses])
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models import Subject

department_bp = Blueprint('department_routes', __name__)

DEPARTMENT_MAP = {
    "Mathematics": "Mathematics",
    "Chemistry": "Sciences",
    "Biology": "Sciences",
    "Physics": "Sciences",
    "Computer": "Technicals",
    "Agriculture": "Technicals",
    "Business": "Technicals",
    "French": "Technicals",
    "English": "Languages",
    "Kiswahili": "Languages",
    "Geography": "Humanities",
    "History": "Humanities",
    "CRE": "Humanities"
}

@department_bp.route('/departments', methods=['GET'])
@jwt_required()
def get_departments():
    # Get unique department names
    departments = set(DEPARTMENT_MAP.values())
    return jsonify(sorted(list(departments))), 200

@department_bp.route('/departments/<department_name>/subjects', methods=['GET'])
@jwt_required()
def get_subjects_by_department(department_name):
    # Find subjects in this department
    subjects = [name for name, dept in DEPARTMENT_MAP.items() if dept.lower() == department_name.lower()]
    subject_objs = Subject.query.filter(Subject.name.in_(subjects)).all()
    return jsonify([s.to_dict() for s in subject_objs]), 200

@department_bp.route('/departments/<department_name>/teachers', methods=['GET'])
@jwt_required()
def get_teachers_by_department(department_name):
    # Find subjects in this department
    subjects = [name for name, dept in DEPARTMENT_MAP.items() if dept.lower() == department_name.lower()]
    subject_objs = Subject.query.filter(Subject.name.in_(subjects)).all()
    teachers = []
    for subj in subject_objs:
        if subj.teacher:
            teachers.append(subj.teacher.to_dict())
    # Remove duplicates (by teacher id)
    unique_teachers = {t['id']: t for t in teachers}.values()
    return jsonify(list(unique_teachers)), 200
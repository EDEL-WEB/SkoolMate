from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import Student, Subject, Enrollment, db
from app.auth import admin_required, teacher_required

course_bp = Blueprint('course_routes', __name__)

# Define the groups and rules
COURSE_GROUPS = {
    "Compulsory": {
        "subjects": ["English", "Kiswahili", "Maths", "Chemistry"],
        "rule": "must_enroll"
    },
    "GroupA": {
        "subjects": ["Geography", "CRE"],
        "rule": "choose_one"
    },
    "GroupB": {
        "subjects": ["Physics", "Biology"],
        "rule": "choose_one_or_both"
    },
    "GroupC": {
        "subjects": ["Computer", "Agriculture", "Business", "History","French"],
        "rule": "choose_one"
    }
}

@course_bp.route('/courses/groups', methods=['GET'])
@jwt_required()
def get_course_groups():
    return jsonify(COURSE_GROUPS), 200

@course_bp.route('/courses/subjects', methods=['GET'])
@jwt_required()
def get_all_subjects():
    subjects = Subject.query.all()
    return jsonify([s.to_dict() for s in subjects]), 200

@course_bp.route('/courses/enroll', methods=['POST'])
@jwt_required()
def enroll_courses():
    data = request.get_json()
    student_id = data.get('student_id')
    selected_subjects = data.get('subjects', [])

    # Validate compulsory subjects
    compulsory = set(COURSE_GROUPS["Compulsory"]["subjects"])
    if not compulsory.issubset(set(selected_subjects)):
        return jsonify({"error": "All compulsory subjects must be enrolled."}), 400

    # Validate Group A (choose only one)
    group_a = set(COURSE_GROUPS["GroupA"]["subjects"])
    if len(group_a.intersection(selected_subjects)) != 1:
        return jsonify({"error": "Choose only one subject from Group A."}), 400

    # Validate Group B (choose one or both)
    group_b = set(COURSE_GROUPS["GroupB"]["subjects"])
    if len(group_b.intersection(selected_subjects)) < 1 or len(group_b.intersection(selected_subjects)) > 2:
        return jsonify({"error": "Choose one or both subjects from Group B."}), 400

    # Validate Group C (History and one of the other three, or just one of the other three)
    group_c_subjects = COURSE_GROUPS["GroupC"]["subjects"]
    group_c = set(group_c_subjects)
    selected_group_c = group_c.intersection(selected_subjects)

    # Separate History from the rest
    history = "History"
    others = {"Computer", "Agriculture", "Business","French"}
    selected_others = others.intersection(selected_subjects)
    selected_history = history in selected_subjects

    if selected_history:
        if len(selected_others) != 1 or len(selected_group_c) != 2:
            return jsonify({"error": "If History is chosen, you must choose exactly one from Computer, Agriculture, or Business (total 2 from Group C)."}), 400
    else:
        if len(selected_others) != 1 or len(selected_group_c) != 1:
            return jsonify({"error": "Choose exactly one from Computer, Agriculture, or Business if not choosing History."}), 400

    # Remove previous enrollments
    Enrollment.query.filter_by(student_id=student_id).delete()

    # Enroll in selected subjects
    for subject_name in selected_subjects:
        subject = Subject.query.filter_by(name=subject_name).first()
        if subject:
            enrollment = Enrollment(student_id=student_id, subject_id=subject.id)
            db.session.add(enrollment)
    db.session.commit()
    return jsonify({"message": "Enrollment successful."}), 200

@course_bp.route('/courses/enrollment/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_enrollment(student_id):
    enrollments = Enrollment.query.filter_by(student_id=student_id).all()
    return jsonify([e.subject.to_dict() for e in enrollments]), 200
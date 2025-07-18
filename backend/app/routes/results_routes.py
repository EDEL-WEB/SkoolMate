from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import Report, db
from app.auth import teacher_required, admin_required

result_bp = Blueprint('result_routes', __name__)

# Get results for a student
@result_bp.route('/results/student/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_results(student_id):
    results = Report.query.filter_by(student_id=student_id).all()
    return jsonify([r.to_dict() for r in results]), 200

# Post new result
@result_bp.route('/results', methods=['POST'])
@jwt_required()
@teacher_required
def post_result():
    data = request.get_json()
    result = Report(
        student_id=data['student_id'],
        subject=data['subject'],
        term=data['term'],
        score=data['score']
    )
    db.session.add(result)
    db.session.commit()
    return jsonify(result.to_dict()), 201

# Update a result
@result_bp.route('/results/<int:id>', methods=['PATCH'])
@jwt_required()
@teacher_required
def update_result(id):
    result = Report.query.get_or_404(id)
    data = request.get_json()
    result.score = data.get('score', result.score)
    db.session.commit()
    return jsonify(result.to_dict()), 200

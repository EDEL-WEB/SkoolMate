from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import db, Report, Fee  # <-- Add Fee here
from app.auth import teacher_required, admin_required

report_bp = Blueprint('report_routes', __name__)

# GET all reports
@report_bp.route('/reports', methods=['GET'])
@jwt_required()
@admin_required
def get_all_reports():
    reports = Report.query.all()
    return jsonify([report.to_dict() for report in reports]), 200

# GET reports for a specific student
@report_bp.route('/reports/student/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_reports(student_id):
    reports = Report.query.filter_by(student_id=student_id).all()
    return jsonify([r.to_dict() for r in reports]), 200

# GET reports and fees summary for a specific student
@report_bp.route('/reports/student/<int:student_id>/summary', methods=['GET'])
@jwt_required()
def get_student_summary(student_id):
    reports = Report.query.filter_by(student_id=student_id).all()
    fees = Fee.query.filter_by(student_id=student_id).all()
    return jsonify({
        "reports": [r.to_dict() for r in reports],
        "fees": [f.to_dict() for f in fees]
    }), 200

# POST new report entry
@report_bp.route('/reports', methods=['POST'])
@jwt_required()
@teacher_required
def create_report():
    data = request.get_json()
    report = Report(
        student_id=data['student_id'],
        term=data['term'],
        subject=data['subject'],
        score=data['score']
    )
    db.session.add(report)
    db.session.commit()
    return jsonify(report.to_dict()), 201

# PATCH update report score
@report_bp.route('/reports/<int:id>', methods=['PATCH'])
@jwt_required()
@teacher_required
def update_report(id):
    report = Report.query.get_or_404(id)
    data = request.get_json()
    report.score = data.get('score', report.score)
    db.session.commit()
    return jsonify(report.to_dict()), 200

# DELETE a report
@report_bp.route('/reports/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_report(id):
    report = Report.query.get_or_404(id)
    db.session.delete(report)
    db.session.commit()
    return jsonify({"message": "Report deleted"}), 200

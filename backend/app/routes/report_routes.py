from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models import Report

report_bp = Blueprint('report_bp', __name__)

@report_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_reports():
    reports = Report.query.all()
    return jsonify([report.to_dict() for report in reports])
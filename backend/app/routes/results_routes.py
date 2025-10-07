from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models import Result

results_bp = Blueprint('results_bp', __name__)

@results_bp.route('/results', methods=['GET'])
@jwt_required()
def get_results():
    results = Result.query.all()
    return jsonify([result.to_dict() for result in results])
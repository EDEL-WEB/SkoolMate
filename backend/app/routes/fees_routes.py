from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models import Fee

fees_bp = Blueprint('fees_bp', __name__)

@fees_bp.route('/fees', methods=['GET'])
@jwt_required()
def get_fees():
    fees = Fee.query.all()
    return jsonify([fee.to_dict() for fee in fees])
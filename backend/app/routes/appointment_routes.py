from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models import Appointment

appointment_bp = Blueprint('appointment_bp', __name__)

@appointment_bp.route('/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    appointments = Appointment.query.all()
    return jsonify([app.to_dict() for app in appointments])
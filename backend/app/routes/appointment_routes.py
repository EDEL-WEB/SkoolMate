from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Appointment

appointment_bp = Blueprint('appointment_bp', __name__, url_prefix='/appointments')

# Create an appointment
@appointment_bp.route('/', methods=['POST'])
@jwt_required()
def create_appointment():
    data = request.get_json()
    student_id = get_jwt_identity()

    new_appt = Appointment(
        student_id=student_id,
        teacher_id=data['teacher_id'],
        date=data['date'],
        time=data['time'],
        reason=data.get('reason', '')
    )
    db.session.add(new_appt)
    db.session.commit()

    return jsonify(new_appt.to_dict()), 201

# Get all appointments
@appointment_bp.route('/', methods=['GET'])
@jwt_required()
def get_appointments():
    appointments = Appointment.query.all()
    return jsonify([a.to_dict() for a in appointments]), 200

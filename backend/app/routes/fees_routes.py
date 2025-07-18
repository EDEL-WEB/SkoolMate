from flask import Blueprint, request, jsonify
from app.models import db, Fee
from flask_jwt_extended import jwt_required
from app.auth import admin_required

fees_bp = Blueprint('fees_routes', __name__)

# GET all fees
@fees_bp.route('/fees', methods=['GET'])
@jwt_required()
@admin_required
def get_fees():
    fees = Fee.query.all()
    return jsonify([fee.to_dict() for fee in fees]), 200

# GET fee for a specific student
@fees_bp.route('/fees/student/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_fees(student_id):
    fees = Fee.query.filter_by(student_id=student_id).all()
    return jsonify([fee.to_dict() for fee in fees]), 200

# POST a new fee record
@fees_bp.route('/fees', methods=['POST'])
@jwt_required()
@admin_required
def create_fee():
    data = request.get_json()
    fee = Fee(
        student_id=data['student_id'],
        term=data['term'],
        amount_due=data['amount_due'],
        amount_paid=data.get('amount_paid', 0.0)
    )
    db.session.add(fee)
    db.session.commit()
    return jsonify(fee.to_dict()), 201

# PATCH update fee payment
@fees_bp.route('/fees/<int:id>', methods=['PATCH'])
@jwt_required()
@admin_required
def update_fee(id):
    fee = Fee.query.get_or_404(id)
    data = request.get_json()
    fee.amount_paid = data.get('amount_paid', fee.amount_paid)
    fee.amount_due = data.get('amount_due', fee.amount_due)
    db.session.commit()
    return jsonify(fee.to_dict()), 200

# DELETE a fee record
@fees_bp.route('/fees/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_fee(id):
    fee = Fee.query.get_or_404(id)
    db.session.delete(fee)
    db.session.commit()
    return jsonify({"message": "Fee record deleted"}), 200

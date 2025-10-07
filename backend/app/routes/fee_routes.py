from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Student, Fee, FeePayment
from datetime import datetime, timedelta

fee_bp = Blueprint('fee_bp', __name__)

@fee_bp.route('/student/fees', methods=['GET'])
@jwt_required()
def get_student_fees():
    current_user = get_jwt_identity()
    student = Student.query.filter_by(user_id=current_user['id']).first()
    
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    # Get all fees for student
    fees = Fee.query.filter_by(student_id=student.id).all()
    
    # Get payment history
    payments = FeePayment.query.filter_by(student_id=student.id).order_by(FeePayment.created_at.desc()).all()
    
    # Calculate totals
    total_fees = sum(fee.amount for fee in fees)
    total_paid = sum(payment.amount for payment in payments if payment.status == 'completed')
    outstanding = total_fees - total_paid
    
    return jsonify({
        'fees': [fee.to_dict() for fee in fees],
        'payments': [payment.to_dict() for payment in payments],
        'summary': {
            'total_fees': total_fees,
            'total_paid': total_paid,
            'outstanding': outstanding
        }
    })

@fee_bp.route('/student/fees/pay', methods=['POST'])
@jwt_required()
def process_payment():
    current_user = get_jwt_identity()
    student = Student.query.filter_by(user_id=current_user['id']).first()
    
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    data = request.get_json()
    
    try:
        payment = FeePayment(
            student_id=student.id,
            amount=data['amount'],
            payment_method=data['payment_method'],
            reference_number=f"PAY{datetime.now().strftime('%Y%m%d%H%M%S')}{student.id}",
            status='completed'  # Mock payment - in real app, integrate with payment gateway
        )
        
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            'message': 'Payment processed successfully',
            'payment': payment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Payment processing failed'}), 500

@fee_bp.route('/admin/fees', methods=['GET'])
@jwt_required()
def get_all_fees():
    fees = Fee.query.all()
    return jsonify([fee.to_dict() for fee in fees])

@fee_bp.route('/admin/fees', methods=['POST'])
@jwt_required()
def create_fee():
    data = request.get_json()
    
    try:
        fee = Fee(
            student_id=data['student_id'],
            fee_type=data['fee_type'],
            amount=data['amount'],
            due_date=datetime.strptime(data['due_date'], '%Y-%m-%d').date(),
            description=data.get('description', '')
        )
        
        db.session.add(fee)
        db.session.commit()
        
        return jsonify(fee.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create fee'}), 500

@fee_bp.route('/admin/fees/overview', methods=['GET'])
@jwt_required()
def get_fee_overview():
    # Total fees
    total_fees = db.session.query(db.func.sum(Fee.amount)).scalar() or 0
    
    # Total payments
    total_payments = db.session.query(db.func.sum(FeePayment.amount)).filter(
        FeePayment.status == 'completed'
    ).scalar() or 0
    
    # Outstanding fees
    outstanding = total_fees - total_payments
    
    # Recent payments
    recent_payments = FeePayment.query.filter(
        FeePayment.status == 'completed'
    ).order_by(FeePayment.created_at.desc()).limit(10).all()
    
    return jsonify({
        'total_fees': total_fees,
        'total_collected': total_payments,
        'outstanding': outstanding,
        'collection_rate': (total_payments / total_fees * 100) if total_fees > 0 else 0,
        'recent_payments': [payment.to_dict() for payment in recent_payments]
    })
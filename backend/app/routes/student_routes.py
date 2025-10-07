from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Student, Result, Fee, Report, Attendance, db

student_bp = Blueprint('student_bp', __name__)

# GET all students (accessible by admin and teachers)
@student_bp.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    students = Student.query.all()
    return jsonify([student.to_dict() for student in students])

# Create student (admin only)
@student_bp.route('/students', methods=['POST'])
@jwt_required()
def create_student():
    data = request.get_json()
    try:
        from ..models import Classroom
        
        # Handle class_name and stream or classroom_id
        classroom_id = data.get('classroom_id')
        if not classroom_id and data.get('class_name') and data.get('stream'):
            # Create classroom name from class and stream
            classroom_name = f"{data['class_name']}{data['stream']}"
            
            # Find or create classroom
            classroom = Classroom.query.filter_by(name=classroom_name).first()
            if not classroom:
                classroom = Classroom(name=classroom_name)
                db.session.add(classroom)
                db.session.flush()  # Get the ID
            classroom_id = classroom.id
        
        # Convert date string to date object
        date_of_birth = None
        if data.get('date_of_birth'):
            from datetime import datetime
            date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        
        student = Student(
            user_id=data['user_id'],
            full_name=data['full_name'],
            gender=data.get('gender'),
            date_of_birth=date_of_birth,
            parent_contact=data.get('parent_contact'),
            classroom_id=classroom_id
        )
        db.session.add(student)
        db.session.commit()
        return jsonify(student.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create student: {str(e)}"}), 500

# Student-specific routes
@student_bp.route('/student/reports', methods=['GET'])
@jwt_required()
def get_my_reports():
    current_user_id = get_jwt_identity()
    student = Student.query.filter_by(user_id=current_user_id).first()
    if not student:
        return jsonify([])
    
    reports = Report.query.filter_by(student_id=student.id).all()
    return jsonify([report.to_dict() for report in reports])

@student_bp.route('/student/fees', methods=['GET'])
@jwt_required()
def get_my_fees():
    current_user_id = get_jwt_identity()
    student = Student.query.filter_by(user_id=current_user_id).first()
    if not student:
        return jsonify([])
    
    fees = Fee.query.filter_by(student_id=student.id).all()
    return jsonify([fee.to_dict() for fee in fees])

@student_bp.route('/student/results', methods=['GET'])
@jwt_required()
def get_my_results():
    current_user_id = get_jwt_identity()
    student = Student.query.filter_by(user_id=current_user_id).first()
    if not student:
        return jsonify([])
    
    results = Result.query.filter_by(student_id=student.id).all()
    return jsonify([result.to_dict() for result in results])

@student_bp.route('/student/attendance', methods=['GET'])
@jwt_required()
def get_my_attendance():
    from ..models import Attendance
    current_user_id = get_jwt_identity()
    student = Student.query.filter_by(user_id=current_user_id).first()
    if not student:
        return jsonify([])
    
    attendance = Attendance.query.filter_by(student_id=student.id).all()
    return jsonify([att.to_dict() for att in attendance])

@student_bp.route('/student/dashboard', methods=['GET'])
@jwt_required()
def get_student_dashboard():
    from ..models import Attendance, Exam
    from sqlalchemy import func
    
    current_user_id = get_jwt_identity()
    student = Student.query.filter_by(user_id=current_user_id).first()
    if not student:
        return jsonify({"error": "Student not found"}), 404
    
    # Calculate GPA
    results = Result.query.filter_by(student_id=student.id).all()
    gpa = sum(r.score for r in results) / len(results) if results else 0
    
    # Calculate attendance rate
    total_attendance = Attendance.query.filter_by(student_id=student.id).count()
    present_count = Attendance.query.filter_by(student_id=student.id, status='present').count()
    attendance_rate = (present_count / total_attendance * 100) if total_attendance > 0 else 0
    
    # Get unpaid fees
    unpaid_fees = Fee.query.filter_by(student_id=student.id, is_paid=False).count()
    
    return jsonify({
        "student": student.to_dict(),
        "gpa": round(gpa, 2),
        "attendance_rate": round(attendance_rate, 1),
        "total_subjects": len(set(r.exam.subject_id for r in results if r.exam)),
        "unpaid_fees": unpaid_fees,
        "recent_results": [r.to_dict() for r in results[-5:]]  # Last 5 results
    })
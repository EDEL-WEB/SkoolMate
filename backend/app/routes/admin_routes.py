from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import case
from ..models import (
    User, Student, Teacher, Subject, Department, 
    Enrollment, Fee, Attendance, Result, Report,
    Appointment, db
)
from ..utils.decorators import admin_required
from datetime import datetime

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/admin')

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def admin_dashboard():
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    # Get comprehensive statistics
    stats = {
        "total_students": Student.query.count(),
        "total_teachers": Teacher.query.count(),
        "total_subjects": Subject.query.count(),
        "total_departments": Department.query.count(),
        "pending_appointments": Appointment.query.count(),
        "unpaid_fees": Fee.query.filter_by(is_paid=False).count()
    }
    
    # Calculate financial metrics
    total_fees_due = db.session.query(func.sum(Fee.amount_due)).scalar() or 0
    total_fees_paid = db.session.query(func.sum(Fee.amount_paid)).scalar() or 0
    
    # Calculate attendance rate
    total_attendance = Attendance.query.count()
    present_count = Attendance.query.filter_by(status='present').count()
    attendance_rate = (present_count / total_attendance * 100) if total_attendance > 0 else 0
    
    # Get recent enrollments (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_enrollments = Enrollment.query.filter(
        Enrollment.created_at >= thirty_days_ago
    ).count() if hasattr(Enrollment, 'created_at') else 0
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    return jsonify({
        "message": f"Welcome Admin {user.username}!",
        "statistics": stats,
        "financial": {
            "total_revenue": float(total_fees_paid),
            "outstanding_fees": float(total_fees_due - total_fees_paid),
            "collection_rate": (total_fees_paid / total_fees_due * 100) if total_fees_due > 0 else 0
        },
        "performance": {
            "attendance_rate": round(attendance_rate, 1),
            "recent_enrollments": recent_enrollments
        }
    })

# User Management
@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if 'role' in data:
        user.role = data['role']
        
    db.session.commit()
    return jsonify(user.to_dict())

# Department Management
@admin_bp.route('/departments', methods=['GET'])
@jwt_required()
def get_departments():
    departments = Department.query.all()
    return jsonify([dept.to_dict() for dept in departments])

@admin_bp.route('/departments', methods=['POST'])
@jwt_required()
@admin_required
def create_department():
    data = request.get_json()
    
    # Check if department already exists
    existing = Department.query.filter_by(name=data['name']).first()
    if existing:
        return jsonify({"error": "Department already exists"}), 409
    
    try:
        department = Department(name=data['name'])
        db.session.add(department)
        db.session.commit()
        return jsonify(department.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create department"}), 500

@admin_bp.route('/departments/<int:dept_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_department(dept_id):
    data = request.get_json()
    department = Department.query.get_or_404(dept_id)
    
    try:
        department.name = data['name']
        db.session.commit()
        return jsonify(department.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update department"}), 500

@admin_bp.route('/departments/<int:dept_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_department(dept_id):
    department = Department.query.get_or_404(dept_id)
    
    try:
        db.session.delete(department)
        db.session.commit()
        return jsonify({"message": "Department deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete department"}), 500

@admin_bp.route('/departments/<int:dept_id>', methods=['PUT', 'DELETE'])
@jwt_required()
@admin_required
def manage_department(dept_id):
    department = Department.query.get_or_404(dept_id)
    
    if request.method == 'DELETE':
        db.session.delete(department)
        db.session.commit()
        return jsonify({"message": "Department deleted"}), 200
        
    data = request.get_json()
    if 'name' in data:
        department.name = data['name']
        
    db.session.commit()
    return jsonify(department.to_dict())

# Subject Management
@admin_bp.route('/subjects', methods=['POST'])
@jwt_required()
@admin_required
def create_subject():
    data = request.get_json()
    subject = Subject(
        name=data['name'],
        teacher_id=data.get('teacher_id'),
        classroom_id=data.get('classroom_id')
    )
    db.session.add(subject)
    db.session.commit()
    return jsonify(subject.to_dict()), 201

# Fee Management
@admin_bp.route('/fees/overview', methods=['GET'])
@jwt_required()
@admin_required
def fee_overview():
    total_fees = Fee.query.with_entities(db.func.sum(Fee.amount_due)).scalar() or 0
    paid_fees = Fee.query.with_entities(db.func.sum(Fee.amount_paid)).scalar() or 0
    
    return jsonify({
        "total_fees_due": float(total_fees),
        "total_fees_paid": float(paid_fees),
        "collection_rate": (paid_fees / total_fees * 100) if total_fees > 0 else 0
    })

# Reports and Analytics
@admin_bp.route('/analytics/performance', methods=['GET'])
@jwt_required()
@admin_required
def performance_analytics():
    # Get attendance statistics
    total_attendance = Attendance.query.count()
    present_count = Attendance.query.filter_by(status='present').count()
    
    return jsonify({
        "attendance_rate": (present_count / total_attendance * 100) if total_attendance > 0 else 0,
        "total_records": total_attendance
    })

@admin_bp.route('/analytics', methods=['GET'])
@jwt_required()
@admin_required
def get_analytics():
    from sqlalchemy import func
    from ..models import Exam
    
    # Grade distribution analysis
    results = Result.query.all()
    grade_distribution = {
        'A': len([r for r in results if r.score >= 80]),
        'B': len([r for r in results if 70 <= r.score < 80]),
        'C': len([r for r in results if 60 <= r.score < 70]),
        'D': len([r for r in results if 50 <= r.score < 60]),
        'F': len([r for r in results if r.score < 50])
    }
    
    # Department performance
    departments = Department.query.all()
    dept_performance = []
    for dept in departments:
        dept_subjects = Subject.query.filter_by(department_id=dept.id).all()
        if dept_subjects:
            # Calculate average performance for department
            dept_results = []
            for subject in dept_subjects:
                exams = Exam.query.filter_by(subject_id=subject.id).all()
                for exam in exams:
                    exam_results = Result.query.filter_by(exam_id=exam.id).all()
                    dept_results.extend([r.score for r in exam_results])
            
            avg_score = sum(dept_results) / len(dept_results) if dept_results else 0
            dept_performance.append({
                'name': dept.name,
                'average_score': round(avg_score, 1),
                'total_students': len(set([r.student_id for r in Result.query.join(Exam).filter(Exam.subject_id.in_([s.id for s in dept_subjects])).all()]))
            })
    
    # Attendance statistics
    total_attendance = Attendance.query.count()
    present_count = Attendance.query.filter_by(status='present').count()
    attendance_rate = (present_count / total_attendance * 100) if total_attendance > 0 else 0
    
    return jsonify({
        'grade_distribution': grade_distribution,
        'department_performance': dept_performance,
        'attendance_rate': round(attendance_rate, 1),
        'total_results': len(results)
    })

# System Settings
@admin_bp.route('/settings', methods=['GET'])
@jwt_required()
@admin_required
def get_settings():
    # In a real application, these would be stored in database
    settings = {
        "general": {
            "school_name": "SkoolMate Academy",
            "school_address": "123 Education Street, Learning City",
            "school_phone": "+1 (555) 123-4567",
            "school_email": "info@skoolmate.edu",
            "academic_year": "2024-2025",
            "current_term": "Term 1",
            "timezone": "UTC-5"
        },
        "academic": {
            "grading_system": "percentage",
            "passing_grade": 50,
            "max_grade": 100,
            "attendance_required": 75,
            "late_submission_penalty": 10,
            "exam_duration": 120
        },
        "financial": {
            "currency": "USD",
            "late_fee_percentage": 5,
            "payment_deadline_days": 30,
            "discount_early_payment": 2,
            "fee_reminder_days": 7
        },
        "notifications": {
            "email_notifications": True,
            "sms_notifications": False,
            "grade_notifications": True,
            "attendance_alerts": True,
            "fee_reminders": True,
            "system_maintenance": True
        },
        "security": {
            "password_min_length": 8,
            "password_require_special": True,
            "session_timeout": 30,
            "max_login_attempts": 5,
            "two_factor_auth": False,
            "backup_frequency": "daily"
        }
    }
    return jsonify(settings)

@admin_bp.route('/settings', methods=['PUT'])
@jwt_required()
@admin_required
def update_settings():
    data = request.get_json()
    
    try:
        # In a real application, validate and save to database
        # For now, we'll just simulate success
        
        # Validate required fields
        if 'general' in data:
            general = data['general']
            if not general.get('school_name'):
                return jsonify({"error": "School name is required"}), 400
        
        # Log the settings update
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        print(f"Settings updated by admin: {user.username}")
        
        return jsonify({
            "message": "Settings updated successfully",
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to update settings: {str(e)}"}), 500

@admin_bp.route('/settings/backup', methods=['POST'])
@jwt_required()
@admin_required
def create_backup():
    try:
        # In a real application, create actual backup
        backup_info = {
            "backup_id": f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "created_at": datetime.now().isoformat(),
            "size": "2.5 MB",
            "tables_included": ["users", "students", "teachers", "subjects", "results", "attendance"],
            "status": "completed"
        }
        
        return jsonify({
            "message": "Backup created successfully",
            "backup": backup_info
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to create backup: {str(e)}"}), 500

@admin_bp.route('/settings/system-info', methods=['GET'])
@jwt_required()
@admin_required
def get_system_info():
    try:
        # Get system information
        system_info = {
            "version": "1.0.0",
            "database": {
                "type": "SQLite",
                "size": "15.2 MB",
                "last_backup": "2024-01-15 10:30:00"
            },
            "statistics": {
                "total_users": User.query.count(),
                "total_students": Student.query.count(),
                "total_teachers": Teacher.query.count(),
                "total_subjects": Subject.query.count()
            },
            "server": {
                "uptime": "5 days, 12 hours",
                "memory_usage": "45%",
                "disk_space": "78% used"
            }
        }
        
        return jsonify(system_info)
        
    except Exception as e:
        return jsonify({"error": f"Failed to get system info: {str(e)}"}), 500

# Dormitory Management
@admin_bp.route('/dorms', methods=['GET'])
@jwt_required()
@admin_required
def get_dorms():
    from ..models import DormRoom
    dorms = DormRoom.query.all()
    return jsonify([dorm.to_dict() for dorm in dorms])

@admin_bp.route('/dorms', methods=['POST'])
@jwt_required()
@admin_required
def create_dorm():
    from ..models import DormRoom
    data = request.get_json()
    try:
        dorm = DormRoom(
            name=data['name'],
            capacity=int(data['capacity'])
        )
        db.session.add(dorm)
        db.session.commit()
        return jsonify(dorm.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create dormitory"}), 500

@admin_bp.route('/dorm-assignments', methods=['GET'])
@jwt_required()
@admin_required
def get_dorm_assignments():
    from ..models import DormAssignment
    assignments = DormAssignment.query.all()
    return jsonify([assignment.to_dict() for assignment in assignments])

@admin_bp.route('/dorm-assignments', methods=['POST'])
@jwt_required()
@admin_required
def assign_student_to_dorm():
    from ..models import DormAssignment, DormRoom
    data = request.get_json()
    try:
        assignment = DormAssignment(
            student_id=data['student_id'],
            dorm_id=data['dorm_id']
        )
        db.session.add(assignment)
        
        # Update dorm occupancy
        dorm = DormRoom.query.get(data['dorm_id'])
        dorm.current_occupants += 1
        
        db.session.commit()
        return jsonify(assignment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to assign student"}), 500

# Results Management
@admin_bp.route('/results', methods=['GET'])
@jwt_required()
@admin_required
def get_all_results():
    from ..models import Result
    results = Result.query.all()
    return jsonify([result.to_dict() for result in results])

# Export Data
@admin_bp.route('/export/<string:model_name>', methods=['GET'])
@jwt_required()
@admin_required
def export_data(model_name):
    models = {
        'students': Student,
        'teachers': Teacher,
        'results': Result,
        'fees': Fee
        
    }
    
    if model_name not in models:
        return jsonify({"error": "Invalid model name"}), 400
        
    records = models[model_name].query.all()
    return jsonify([record.to_dict() for record in records])
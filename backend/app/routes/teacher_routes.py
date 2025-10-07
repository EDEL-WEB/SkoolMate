from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Teacher, Subject, Student, Enrollment, Result, Attendance, Exam, db
from datetime import datetime
from ..utils.decorators import teacher_required

teacher_bp = Blueprint('teacher_bp', __name__)

# Get all teachers
@teacher_bp.route('/teachers', methods=['GET'])
@jwt_required()
def get_teachers():
    teachers = Teacher.query.all()
    return jsonify([teacher.to_dict() for teacher in teachers])

# Create teacher (admin only)
@teacher_bp.route('/teachers', methods=['POST'])
@jwt_required()
def create_teacher():
    data = request.get_json()
    try:
        teacher = Teacher(
            user_id=data['user_id'],
            full_name=data['full_name'],
            department_id=data.get('department_id')
        )
        db.session.add(teacher)
        db.session.commit()
        return jsonify(teacher.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create teacher"}), 500

# Teacher-specific routes
@teacher_bp.route('/teacher/my-subjects', methods=['GET'])
@jwt_required()
def get_my_subjects():
    current_user_id = get_jwt_identity()
    teacher = Teacher.query.filter_by(user_id=current_user_id).first()
    
    if not teacher:
        # If admin, return all subjects
        subjects = Subject.query.all()
        return jsonify([subject.to_dict() for subject in subjects])
    
    subjects = Subject.query.filter_by(teacher_id=teacher.id).all()
    return jsonify([subject.to_dict() for subject in subjects])

@teacher_bp.route('/teacher/subjects/<int:subject_id>/students', methods=['GET'])
@jwt_required()
def get_subject_students(subject_id):
    try:
        enrollments = Enrollment.query.filter_by(subject_id=subject_id).all()
        students = []
        for enrollment in enrollments:
            if enrollment.student:
                students.append(enrollment.student.to_dict())
        
        print(f"Found {len(students)} students for subject {subject_id}")
        return jsonify(students)
    except Exception as e:
        print(f"Error fetching students: {str(e)}")
        return jsonify({"error": str(e)}), 500

@teacher_bp.route('/teacher/enrollments', methods=['GET'])
@jwt_required()
def get_enrollments():
    current_user_id = get_jwt_identity()
    teacher = Teacher.query.filter_by(user_id=current_user_id).first()
    
    if not teacher:
        # If admin, return all enrollments
        enrollments = Enrollment.query.all()
        return jsonify([enrollment.to_dict() for enrollment in enrollments])
    
    subjects = Subject.query.filter_by(teacher_id=teacher.id).all()
    enrollments = []
    for subject in subjects:
        subject_enrollments = Enrollment.query.filter_by(subject_id=subject.id).all()
        enrollments.extend(subject_enrollments)
    
    return jsonify([enrollment.to_dict() for enrollment in enrollments])

@teacher_bp.route('/teacher/subjects/<int:subject_id>/results', methods=['GET'])
@jwt_required()
def get_subject_results(subject_id):
    try:
        results = Result.query.join(Exam).filter(Exam.subject_id == subject_id).all()
        results_data = []
        for result in results:
            result_dict = result.to_dict()
            # Ensure we have exam name for display
            if result.exam:
                result_dict['exam_name'] = result.exam.name
            results_data.append(result_dict)
        
        print(f"Found {len(results_data)} results for subject {subject_id}")
        return jsonify(results_data)
    except Exception as e:
        print(f"Error fetching results: {str(e)}")
        return jsonify({"error": str(e)}), 500

@teacher_bp.route('/results', methods=['POST'])
@jwt_required()
def add_result():
    data = request.get_json()
    try:
        print(f"Adding result with data: {data}")
        
        # Validate required fields
        required_fields = ['student_id', 'subject_id', 'exam_name', 'score']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Create or find exam first
        exam = Exam.query.filter_by(
            name=data['exam_name'],
            subject_id=data['subject_id']
        ).first()
        
        if not exam:
            exam = Exam(
                name=data['exam_name'],
                subject_id=data['subject_id']
            )
            db.session.add(exam)
            db.session.flush()  # Get the exam ID
            print(f"Created new exam: {exam.name} with ID: {exam.id}")
        
        # Check if result already exists for this student and exam
        existing_result = Result.query.filter_by(
            student_id=data['student_id'],
            exam_id=exam.id
        ).first()
        
        if existing_result:
            return jsonify({"error": "Result already exists for this student and exam"}), 409
        
        # Create result with exam_id
        result = Result(
            student_id=int(data['student_id']),
            exam_id=exam.id,
            score=float(data['score'])
        )
        db.session.add(result)
        db.session.commit()
        
        print(f"Result added successfully: {result.id}")
        return jsonify(result.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error adding result: {str(e)}")
        return jsonify({"error": f"Failed to add result: {str(e)}"}), 500

@teacher_bp.route('/results/<int:result_id>', methods=['PUT'])
@jwt_required()
def update_result(result_id):
    data = request.get_json()
    result = Result.query.get_or_404(result_id)
    
    try:
        # Update exam name if provided
        if 'exam_name' in data and result.exam:
            result.exam.name = data['exam_name']
        
        # Update score
        if 'score' in data:
            result.score = data['score']
            
        db.session.commit()
        return jsonify(result.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update result: {str(e)}"}), 500

@teacher_bp.route('/results/<int:result_id>', methods=['DELETE'])
@jwt_required()
def delete_result(result_id):
    result = Result.query.get_or_404(result_id)
    
    try:
        db.session.delete(result)
        db.session.commit()
        return jsonify({"message": "Result deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete result"}), 500

@teacher_bp.route('/teacher/dashboard', methods=['GET'])
@jwt_required()
def get_teacher_dashboard():
    from ..models import Attendance
    from sqlalchemy import func, desc
    from datetime import datetime, timedelta
    
    current_user_id = get_jwt_identity()
    teacher = Teacher.query.filter_by(user_id=current_user_id).first()
    
    if not teacher:
        return jsonify({"error": "Teacher not found"}), 404
    
    # Get teacher's subjects
    subjects = Subject.query.filter_by(teacher_id=teacher.id).all()
    subject_ids = [s.id for s in subjects]
    
    # Get enrollments for teacher's subjects
    enrollments = Enrollment.query.filter(Enrollment.subject_id.in_(subject_ids)).all()
    total_students = len(set(e.student_id for e in enrollments))
    
    # Calculate attendance stats
    attendance_records = Attendance.query.filter(
        Attendance.teacher_id == teacher.id
    ).all()
    
    total_attendance = len(attendance_records)
    present_count = len([a for a in attendance_records if a.status == 'present'])
    attendance_rate = (present_count / total_attendance * 100) if total_attendance > 0 else 0
    
    # Get recent results through exam relationship
    recent_results = Result.query.join(Exam).filter(
        Exam.subject_id.in_(subject_ids)
    ).order_by(desc(Result.id)).limit(10).all()
    
    # Calculate average grades per subject
    subject_averages = []
    for subject in subjects:
        results = Result.query.join(Exam).filter(Exam.subject_id == subject.id).all()
        if results:
            avg_score = sum(r.score for r in results) / len(results)
            subject_averages.append({
                'subject': subject.name,
                'average': round(avg_score, 1),
                'total_students': len(set(r.student_id for r in results))
            })
    
    # Get low attendance students (< 75%)
    low_attendance_students = []
    for enrollment in enrollments:
        student_attendance = Attendance.query.filter_by(
            student_id=enrollment.student_id,
            teacher_id=teacher.id
        ).all()
        
        if student_attendance:
            present = len([a for a in student_attendance if a.status == 'present'])
            rate = (present / len(student_attendance)) * 100
            if rate < 75:
                low_attendance_students.append({
                    'student': enrollment.student.full_name,
                    'attendance_rate': round(rate, 1)
                })
    
    return jsonify({
        'teacher': teacher.to_dict(),
        'total_subjects': len(subjects),
        'total_students': total_students,
        'attendance_rate': round(attendance_rate, 1),
        'total_results': len(recent_results),
        'subject_averages': subject_averages,
        'recent_results': [r.to_dict() for r in recent_results],
        'low_attendance_students': low_attendance_students[:5],  # Top 5
        'unread_messages': 0  # Placeholder for messaging system
    })

@teacher_bp.route('/teacher/subjects', methods=['GET'])
@jwt_required()
def get_teacher_subjects():
    current_user_id = get_jwt_identity()
    teacher = Teacher.query.filter_by(user_id=current_user_id).first()
    
    if not teacher:
        return jsonify({'subjects': []})
    
    subjects = Subject.query.filter_by(teacher_id=teacher.id).all()
    subjects_data = []
    
    for subject in subjects:
        # Count enrolled students
        student_count = Enrollment.query.filter_by(subject_id=subject.id).count()
        
        subject_dict = subject.to_dict()
        subject_dict['student_count'] = student_count
        subjects_data.append(subject_dict)
    
    return jsonify({'subjects': subjects_data})

@teacher_bp.route('/attendance', methods=['POST'])
@jwt_required()
def mark_attendance():
    data = request.get_json()
    current_user_id = get_jwt_identity()
    teacher = Teacher.query.filter_by(user_id=current_user_id).first()
    
    if not teacher:
        return jsonify({"error": "Teacher not found"}), 404
    
    try:
        subject_id = data['subject_id']
        date = data['date']
        attendance_data = data['attendance']
        
        # Parse date string to date object
        date_obj = datetime.strptime(date, '%Y-%m-%d').date()
        
        for student_id, status in attendance_data.items():
            # Check if attendance already exists
            existing = Attendance.query.filter_by(
                student_id=int(student_id),
                teacher_id=teacher.id,
                date=date_obj
            ).first()
            
            if existing:
                existing.status = status
            else:
                attendance = Attendance(
                    student_id=int(student_id),
                    teacher_id=teacher.id,
                    date=date_obj,
                    status=status
                )
                db.session.add(attendance)
        
        db.session.commit()
        return jsonify({"message": "Attendance marked successfully"}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to mark attendance: {str(e)}"}), 500

@teacher_bp.route('/attendance/bulk', methods=['POST'])
@jwt_required()
def mark_bulk_attendance():
    data = request.get_json()
    current_user_id = get_jwt_identity()
    teacher = Teacher.query.filter_by(user_id=current_user_id).first()
    
    if not teacher:
        return jsonify({"error": "Teacher not found"}), 404
    
    try:
        subject_id = data['subject_id']
        date = data['date']
        bulk_status = data['bulk_status']  # 'present', 'absent', or 'late'
        
        # Parse date string to date object
        date_obj = datetime.strptime(date, '%Y-%m-%d').date()
        
        # Get all students in the subject
        enrollments = Enrollment.query.filter_by(subject_id=subject_id).all()
        
        for enrollment in enrollments:
            # Check if attendance already exists for this date
            existing = Attendance.query.filter_by(
                student_id=enrollment.student_id,
                teacher_id=teacher.id,
                date=date_obj
            ).first()
            
            if existing:
                existing.status = bulk_status
            else:
                attendance = Attendance(
                    student_id=enrollment.student_id,
                    teacher_id=teacher.id,
                    date=date_obj,
                    status=bulk_status
                )
                db.session.add(attendance)
        
        db.session.commit()
        return jsonify({"message": f"Bulk attendance marked as {bulk_status}"}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to mark bulk attendance"}), 500

@teacher_bp.route('/enrollments', methods=['POST'])
@jwt_required()
def enroll_student():
    data = request.get_json()
    try:
        enrollment = Enrollment(
            student_id=data['student_id'],
            subject_id=data['subject_id']
        )
        db.session.add(enrollment)
        db.session.commit()
        return jsonify(enrollment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to enroll student: {str(e)}"}), 500

@teacher_bp.route('/enrollments/<int:enrollment_id>', methods=['DELETE'])
@jwt_required()
def remove_enrollment(enrollment_id):
    enrollment = Enrollment.query.get_or_404(enrollment_id)
    try:
        db.session.delete(enrollment)
        db.session.commit()
        return jsonify({"message": "Enrollment removed successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to remove enrollment"}), 500

@teacher_bp.route('/attendance', methods=['GET'])
@jwt_required()
def get_attendance():
    current_user_id = get_jwt_identity()
    teacher = Teacher.query.filter_by(user_id=current_user_id).first()
    
    if not teacher:
        return jsonify({"error": "Teacher not found"}), 404
    
    subject_id = request.args.get('subject_id')
    date = request.args.get('date')
    
    query = Attendance.query.filter_by(teacher_id=teacher.id)
    
    if subject_id:
        # Get students enrolled in the subject
        enrollments = Enrollment.query.filter_by(subject_id=subject_id).all()
        student_ids = [e.student_id for e in enrollments]
        query = query.filter(Attendance.student_id.in_(student_ids))
    
    if date:
        date_obj = datetime.strptime(date, '%Y-%m-%d').date()
        query = query.filter_by(date=date_obj)
    
    attendance_records = query.all()
    return jsonify([record.to_dict() for record in attendance_records])

@teacher_bp.route('/teachers/<int:teacher_id>', methods=['DELETE'])
@jwt_required()
def delete_teacher(teacher_id):
    teacher = Teacher.query.get_or_404(teacher_id)
    
    try:
        db.session.delete(teacher)
        db.session.commit()
        return jsonify({"message": "Teacher deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete teacher"}), 500

@teacher_bp.route('/teacher/subject/<int:subject_id>', methods=['GET'])
@jwt_required()
def get_subject_overview(subject_id):
    current_user_id = get_jwt_identity()
    teacher = Teacher.query.filter_by(user_id=current_user_id).first()
    
    if not teacher:
        return jsonify({"error": "Teacher not found"}), 404
    
    subject = Subject.query.filter_by(id=subject_id, teacher_id=teacher.id).first()
    if not subject:
        return jsonify({"error": "Subject not found or unauthorized"}), 404
    
    # Get subject statistics
    enrollments = Enrollment.query.filter_by(subject_id=subject_id).all()
    student_count = len(enrollments)
    
    # Get recent results for this subject
    recent_results = Result.query.join(Exam).filter(
        Exam.subject_id == subject_id
    ).order_by(Result.id.desc()).limit(5).all()
    
    # Calculate average performance
    all_results = Result.query.join(Exam).filter(Exam.subject_id == subject_id).all()
    avg_score = sum(r.score for r in all_results) / len(all_results) if all_results else 0
    
    return jsonify({
        'subject': subject.to_dict(),
        'student_count': student_count,
        'average_score': round(avg_score, 2),
        'recent_results': [r.to_dict() for r in recent_results],
        'total_results': len(all_results)
    })
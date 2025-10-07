from app import create_app
from app.models import db, Student, User

app = create_app()

with app.app_context():
    print("=== Database Debug ===")
    
    # Check users
    users = User.query.all()
    print(f"Total users: {len(users)}")
    for user in users:
        print(f"  - {user.username} ({user.role})")
    
    # Check students
    students = Student.query.all()
    print(f"Total students: {len(students)}")
    for student in students:
        print(f"  - {student.full_name} (ID: {student.id})")
    
    # Check if there are student users without Student records
    student_users = User.query.filter_by(role='student').all()
    print(f"Student users: {len(student_users)}")
    for user in student_users:
        student_record = Student.query.filter_by(user_id=user.id).first()
        if not student_record:
            print(f"  - User {user.username} has no Student record!")
        else:
            print(f"  - User {user.username} -> Student {student_record.full_name}")
    
    print("\n=== Creating fees for first student ===")
    student = Student.query.first()
    if student:
        print(f"Found student: {student.full_name}")
    else:
        print("No students found in database")
from app import create_app
from app.models import db, Student, Fee, User
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Get or create student
    student = Student.query.first()
    
    if not student:
        # Create user first
        user = User(
            username='student1',
            email='student1@school.com',
            password=generate_password_hash('password123'),
            role='student'
        )
        db.session.add(user)
        db.session.flush()
        
        # Create student
        student = Student(
            user_id=user.id,
            full_name='John Doe',
            gender='Male',
            parent_contact='1234567890'
        )
        db.session.add(student)
        db.session.flush()
        print(f"Created student: {student.full_name}")
    
    # Create sample fees using existing Fee model fields
    fees = [
        Fee(
            student_id=student.id,
            term='Semester 1',
            amount_due=1500.00,
            due_date=datetime.now().date() + timedelta(days=30)
        ),
        Fee(
            student_id=student.id,
            term='Library Fee',
            amount_due=50.00,
            due_date=datetime.now().date() + timedelta(days=15)
        ),
        Fee(
            student_id=student.id,
            term='Lab Fee',
            amount_due=200.00,
            due_date=datetime.now().date() + timedelta(days=20)
        )
    ]
    
    for fee in fees:
        db.session.add(fee)
    
    db.session.commit()
    print(f"Created {len(fees)} fee records for student {student.full_name}")
    print(f"Login credentials: username=student1, password=password123")
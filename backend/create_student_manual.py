from app import create_app
from app.models import db, Student, User, Fee
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Create user
    user = User(
        username='testStudent',
        email='test@student.com',
        password=generate_password_hash('password123'),
        role='student'
    )
    db.session.add(user)
    db.session.flush()
    
    # Create student record
    student = Student(
        user_id=user.id,
        full_name='Test Student',
        gender='Male',
        parent_contact='1234567890'
    )
    db.session.add(student)
    db.session.flush()
    
    # Add fees
    fees = [
        Fee(student_id=student.id, term='Tuition', amount_due=1000.00, due_date=datetime.now().date() + timedelta(days=30)),
        Fee(student_id=student.id, term='Library', amount_due=100.00, due_date=datetime.now().date() + timedelta(days=15))
    ]
    
    for fee in fees:
        db.session.add(fee)
    
    db.session.commit()
    print(f"Created student: {student.full_name}")
    print(f"Login: testStudent / password123")
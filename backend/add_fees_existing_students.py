from app import create_app
from app.models import db, Student, Fee
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    # Get all students
    students = Student.query.all()
    print(f"Found {len(students)} students")
    
    for student in students:
        print(f"Adding fees for: {student.full_name}")
        
        # Create fees for each student
        fees = [
            Fee(
                student_id=student.id,
                term='Tuition Fee',
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
    print(f"Created fees for all {len(students)} students!")
    print("Students can now login and make fee payments.")
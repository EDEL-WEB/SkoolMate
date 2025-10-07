from backend.app import create_app
from backend.app.models import db, Department, Classroom

app = create_app()

with app.app_context():
    # Create sample departments
    departments = [
        'Mathematics', 'Science', 'English', 'History', 
        'Physical Education', 'Art', 'Music', 'Computer Science'
    ]
    
    for dept_name in departments:
        existing = Department.query.filter_by(name=dept_name).first()
        if not existing:
            dept = Department(name=dept_name)
            db.session.add(dept)
    
    # Create sample classrooms
    classrooms = [
        'Grade 1A', 'Grade 1B', 'Grade 2A', 'Grade 2B',
        'Grade 3A', 'Grade 3B', 'Grade 4A', 'Grade 4B',
        'Grade 5A', 'Grade 5B', 'Grade 6A', 'Grade 6B'
    ]
    
    for class_name in classrooms:
        existing = Classroom.query.filter_by(name=class_name).first()
        if not existing:
            classroom = Classroom(name=class_name)
            db.session.add(classroom)
    
    db.session.commit()
    print("✅ Sample data created successfully!")
    print(f"📚 Departments: {len(departments)}")
    print(f"🏫 Classrooms: {len(classrooms)}")
from app import create_app
from app.models import db, User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Create admin user
    admin = User(
        username='admin',
        email='admin@school.com',
        password=generate_password_hash('admin123'),
        role='admin'
    )
    
    db.session.add(admin)
    db.session.commit()
    print("Admin user created: admin@school.com / admin123")